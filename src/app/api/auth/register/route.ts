import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, getSessionCookieOptions } from "@/lib/auth/session";
import { ensureBaseRoles } from "@/lib/auth/roles";
import { createAuditLog } from "@/lib/audit";
import { getRequestIp } from "@/lib/auth/request";
import { normalizeRoleKeys } from "@/lib/auth/normalize";

const registerSchema = z.object({
  email: z.email("請輸入正確的 Email"),
  password: z.string().min(8, "密碼至少 8 碼"),
  name: z.string().min(2, "姓名至少 2 字"),
  phone: z.string().min(8).optional(),
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = registerSchema.parse(await req.json());
    const email = body.email.toLowerCase().trim();

    const existed = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existed) {
      return NextResponse.json({ ok: false, message: "Email 已註冊" }, { status: 409 });
    }

    await ensureBaseRoles(prisma);

    const customerRole = await prisma.role.findUnique({
      where: { key: "customer" },
      select: { id: true, key: true },
    });

    if (!customerRole) {
      return NextResponse.json({ ok: false, message: "系統角色尚未初始化" }, { status: 500 });
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
      ip: await getRequestIp(),
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "註冊資料有誤" }, { status: 400 });
    }

    return NextResponse.json({ ok: false, message: "註冊失敗" }, { status: 500 });
  }
}
