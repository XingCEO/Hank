import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles, requireSession } from "@/lib/auth/request";
import { hashPassword } from "@/lib/auth/password";
import { createAuditLog } from "@/lib/audit";
import { getClientIpFromRequest, guardSameOrigin } from "@/lib/security/request-guard";

const patchPasswordSchema = z.object({
  newPassword: z.string().min(8, "新密碼至少 8 碼。"),
});

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  const blockedByOrigin = guardSameOrigin(req);
  if (blockedByOrigin) {
    return blockedByOrigin;
  }

  const auth = await requireSession();
  if ("response" in auth) {
    return auth.response;
  }

  const { session } = auth;
  const forbidden = requireRoles(session, ["admin", "super_admin"]);
  if (forbidden) {
    return forbidden;
  }

  const { id } = await context.params;

  try {
    const body = patchPasswordSchema.parse(await req.json());

    const target = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
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

    if (!target) {
      return NextResponse.json({ ok: false, message: "找不到目標會員。" }, { status: 404 });
    }

    const actorIsSuperAdmin = session.roles.includes("super_admin");
    const targetRoleKeys = target.roles.map((item) => item.role.key);
    if (!actorIsSuperAdmin && targetRoleKeys.includes("super_admin")) {
      return NextResponse.json(
        { ok: false, message: "只有最高管理者可以重設最高管理者密碼。" },
        { status: 403 },
      );
    }

    const passwordHash = await hashPassword(body.newPassword);
    await prisma.user.update({
      where: { id: target.id },
      data: { passwordHash },
    });

    await createAuditLog({
      actorUserId: session.userId,
      action: "admin.user.password.reset",
      resourceType: "user",
      resourceId: target.id,
      payload: { by: session.userId },
      ip: getClientIpFromRequest(req),
    });

    return NextResponse.json({ ok: true, userId: target.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, message: error.issues[0]?.message ?? "密碼資料格式錯誤。" },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: false, message: "重設密碼失敗。" }, { status: 500 });
  }
}
