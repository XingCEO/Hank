import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, getSessionCookieOptions } from "@/lib/auth/session";
import { ensureBaseRoles } from "@/lib/auth/roles";
import { createAuditLog } from "@/lib/audit";
import { normalizeRoleKeys } from "@/lib/auth/normalize";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { getClientIpFromRequest, guardSameOrigin } from "@/lib/security/request-guard";

const registerSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(8).optional(),
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blockedByOrigin = guardSameOrigin(req);
  if (blockedByOrigin) {
    return blockedByOrigin;
  }

  const clientIp = getClientIpFromRequest(req) ?? "unknown";
  const rateLimit = consumeRateLimit({
    key: `auth:register:${clientIp}`,
    limit: 5,
    windowMs: 30 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false, message: "Too many sign-up attempts. Please try again later." }, { status: 429 });
  }

  try {
    const body = registerSchema.parse(await req.json());
    const email = body.email.toLowerCase().trim();

    const existed = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existed) {
      return NextResponse.json({ ok: false, message: "Email already registered." }, { status: 409 });
    }

    await ensureBaseRoles(prisma);

    const customerRole = await prisma.role.findUnique({
      where: { key: "customer" },
      select: { id: true },
    });
    if (!customerRole) {
      return NextResponse.json({ ok: false, message: "Role bootstrap is incomplete." }, { status: 500 });
    }

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: body.name.trim(),
        phone: body.phone?.trim(),
        roles: {
          create: [{ roleId: customerRole.id }],
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      roles: normalizeRoleKeys(user.roles.map((item) => item.role.key)),
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
      action: "auth.register",
      resourceType: "user",
      resourceId: user.id,
      payload: { email: user.email },
      ip: clientIp !== "unknown" ? clientIp : undefined,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "Invalid registration payload." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "Registration failed." }, { status: 500 });
  }
}
