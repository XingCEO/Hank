import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionFromCookies, type AuthSession } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/authorization";
import type { RoleKey } from "@/lib/auth/constants";

export async function getRequestSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  return getSessionFromCookies(cookieStore);
}

export async function requireSession(): Promise<{ session: AuthSession } | { response: NextResponse }> {
  const session = await getRequestSession();

  if (!session) {
    return {
      response: NextResponse.json({ ok: false, message: "請先登入" }, { status: 401 }),
    };
  }

  return { session };
}

export function requireRoles(session: AuthSession, roles: RoleKey[]): NextResponse | null {
  if (hasRole(session, roles)) {
    return null;
  }

  return NextResponse.json({ ok: false, message: "權限不足" }, { status: 403 });
}

export async function getRequestIp(): Promise<string | undefined> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim();
  }
  return headerStore.get("x-real-ip") ?? undefined;
}
