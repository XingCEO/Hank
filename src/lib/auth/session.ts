import { SignJWT, jwtVerify } from "jose";
import { AUTH_COOKIE_NAME, SESSION_TTL_SECONDS, type RoleKey } from "@/lib/auth/constants";
import { prisma } from "@/lib/prisma";
import { normalizeRoleKeys } from "@/lib/auth/normalize";

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

type VerifiedToken = {
  userId: string;
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

export async function verifySessionToken(token: string): Promise<VerifiedToken | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (typeof payload.sub !== "string" || payload.sub.length === 0) {
      return null;
    }

    return {
      userId: payload.sub,
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

  const verified = await verifySessionToken(token);
  if (!verified) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: verified.userId },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      roles: {
        include: {
          role: {
            select: {
              key: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  const roles = normalizeRoleKeys(user.roles.map((item) => item.role.key));
  if (roles.length === 0) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    roles,
  };
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
