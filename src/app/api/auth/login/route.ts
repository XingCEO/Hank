import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, getSessionCookieOptions } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/audit";
import { getRequestIp } from "@/lib/auth/request";
import { normalizeRoleKeys } from "@/lib/auth/normalize";

const loginSchema = z.object({
  email: z.email("請輸入正確的 Email"),
  password: z.string().min(1, "請輸入密碼"),
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = loginSchema.parse(await req.json());
    const email = body.email.toLowerCase().trim();

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
      return NextResponse.json({ ok: false, message: "帳號或密碼錯誤" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ ok: false, message: "此帳號已停用" }, { status: 403 });
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ ok: false, message: "帳號或密碼錯誤" }, { status: 401 });
    }

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
      action: "auth.login",
      resourceType: "user",
      resourceId: user.id,
      payload: { email: user.email },
      ip: await getRequestIp(),
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "登入資料有誤" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "登入失敗" }, { status: 500 });
  }
}
