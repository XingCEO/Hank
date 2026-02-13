import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth/session";
import type { RoleKey } from "@/lib/auth/constants";

export async function requirePageSession(allowedRoles?: RoleKey[]) {
  const cookieStore = await cookies();
  const session = await getSessionFromCookies(cookieStore);

  if (!session) {
    redirect("/");
  }

  if (allowedRoles && !allowedRoles.some((role) => session.roles.includes(role))) {
    redirect("/");
  }

  return session;
}
