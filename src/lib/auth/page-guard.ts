import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth/session";
import type { RoleKey } from "@/lib/auth/constants";
import { getDefaultDashboardPath } from "@/lib/auth/policy";

function withQuery(path: string, query: Record<string, string>): string {
  const params = new URLSearchParams(query);
  const encoded = params.toString();
  return encoded.length > 0 ? `${path}?${encoded}` : path;
}

export async function requirePageSession(allowedRoles?: RoleKey[], currentPath = "/portal") {
  const cookieStore = await cookies();
  const session = await getSessionFromCookies(cookieStore);

  if (!session) {
    redirect(withQuery("/auth", { next: currentPath }));
  }

  if (allowedRoles && !allowedRoles.some((role) => session.roles.includes(role))) {
    const fallbackPath = getDefaultDashboardPath(session.roles);
    if (fallbackPath !== currentPath) {
      redirect(withQuery(fallbackPath, { denied_from: currentPath }));
    }
    redirect(withQuery("/portal", { denied_from: currentPath }));
  }

  return session;
}
