import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, getSessionCookieOptions } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/audit";
import { normalizeRoleKeys } from "@/lib/auth/normalize";
import { checkAccountLock, clearLoginFailures, consumeRateLimit, trackLoginFailure } from "@/lib/security/rate-limit";
import { getClientIpFromRequest, guardSameOrigin } from "@/lib/security/request-guard";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blockedByOrigin = guardSameOrigin(req);
  if (blockedByOrigin) {
    return blockedByOrigin;
  }

  const clientIp = getClientIpFromRequest(req) ?? "unknown";
  const rateLimit = consumeRateLimit({
    key: `auth:login:${clientIp}`,
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false, message: "Too many login attempts. Please try again later." }, { status: 429 });
  }

  try {
    const body = loginSchema.parse(await req.json());
    const email = body.email.toLowerCase().trim();

    /* 帳號鎖定檢查 */
    const lock = checkAccountLock(email);
    if (lock.locked) {
      return NextResponse.json(
        { ok: false, message: "Login temporarily locked due to too many failed attempts.", lockedUntil: lock.lockedUntil },
        { status: 423 },
      );
    }

    const invalidCredentialsResponse = NextResponse.json(
      { ok: false, message: "Invalid email or password." },
      { status: 401 },
    );

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      trackLoginFailure(email);
      return invalidCredentialsResponse;
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      const failResult = trackLoginFailure(email);
      if (failResult.locked) {
        return NextResponse.json(
          { ok: false, message: "Too many failed attempts. Account locked for 15 minutes.", lockedUntil: failResult.lockedUntil },
          { status: 423 },
        );
      }
      return invalidCredentialsResponse;
    }
    if (!user.isActive) {
      return invalidCredentialsResponse;
    }

    /* 登入成功：清除失敗紀錄 */
    clearLoginFailures(email);

    const roles = normalizeRoleKeys(user.roles.map((item: { role: { key: string } }) => item.role.key));
    if (roles.length === 0) {
      return NextResponse.json({ ok: false, message: "Account has no valid roles." }, { status: 403 });
    }

    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      roles,
      sessionVersion: user.sessionVersion ?? 0,
    };

    const token = await createSessionToken(session);
    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: session.roles,
      },
    });

    response.cookies.set({
      ...getSessionCookieOptions(),
      value: token,
    });

    await createAuditLog({
      actorUserId: user.id,
      action: "auth.login",
      resourceType: "user",
      resourceId: user.id,
      payload: { email: user.email },
      ip: clientIp !== "unknown" ? clientIp : undefined,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "Invalid login payload." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "Login failed." }, { status: 500 });
  }
}
