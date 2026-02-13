import { SignJWT, jwtVerify } from "jose";
import { AUTH_COOKIE_NAME, ROLE_KEYS, SESSION_TTL_SECONDS, type RoleKey } from "@/lib/auth/constants";

export type AuthSession = {
  userId: string;
  email: string;
  name: string;
  roles: RoleKey[];
};

type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  roles: RoleKey[];
};

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production.");
  }

  return new TextEncoder().encode(secret ?? "local-dev-secret-change-me");
}

export async function createSessionToken(session: AuthSession): Promise<string> {
  const payload: SessionPayload = {
    sub: session.userId,
    email: session.email,
    name: session.name,
    roles: session.roles,
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const roles = Array.isArray(payload.roles)
      ? payload.roles.filter((value): value is RoleKey => typeof value === "string" && ROLE_KEYS.includes(value as RoleKey))
      : [];

    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string" || roles.length === 0) {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      roles,
    };
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(cookieStore: CookieReader): Promise<AuthSession | null> {
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export function getSessionCookieOptions() {
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
