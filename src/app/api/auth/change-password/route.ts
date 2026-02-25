import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/request";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { passwordPolicySchema } from "@/lib/auth/password-policy";
import { createAuditLog } from "@/lib/audit";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { getClientIpFromRequest, guardSameOrigin } from "@/lib/security/request-guard";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "請輸入目前密碼。"),
    newPassword: passwordPolicySchema,
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: "新密碼不可與目前密碼相同。",
    path: ["newPassword"],
  });

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const blockedByOrigin = guardSameOrigin(req);
  if (blockedByOrigin) {
    return blockedByOrigin;
  }

  const auth = await requireSession();
  if ("response" in auth) {
    return auth.response;
  }

  const { session } = auth;

  const rateLimit = consumeRateLimit({
    key: `auth:change-password:${session.userId}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, message: "密碼變更嘗試太頻繁，請 15 分鐘後再試。" },
      { status: 429 },
    );
  }

  try {
    const body = changePasswordSchema.parse(await req.json());

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ ok: false, message: "帳號狀態無效，請重新登入。" }, { status: 401 });
    }

    if (!user.passwordHash) {
      return NextResponse.json({ ok: false, message: "此帳號尚未設定密碼。" }, { status: 400 });
    }

    const valid = await verifyPassword(body.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ ok: false, message: "目前密碼不正確。" }, { status: 400 });
    }

    const passwordHash = await hashPassword(body.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        sessionVersion: { increment: 1 },
      },
    });

    await createAuditLog({
      actorUserId: user.id,
      action: "auth.password.change",
      resourceType: "user",
      resourceId: user.id,
      payload: {},
      ip: getClientIpFromRequest(req),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, message: error.issues[0]?.message ?? "密碼資料格式錯誤。" },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: false, message: "更新密碼失敗。" }, { status: 500 });
  }
}
