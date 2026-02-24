import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles, requireSession } from "@/lib/auth/request";
import { createAuditLog } from "@/lib/audit";
import { getClientIpFromRequest, guardSameOrigin } from "@/lib/security/request-guard";

const patchStatusSchema = z.object({
  isActive: z.boolean(),
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
    const body = patchStatusSchema.parse(await req.json());

    const target = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
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

    if (!target) {
      return NextResponse.json({ ok: false, message: "找不到目標會員。" }, { status: 404 });
    }

    const actorIsSuperAdmin = session.roles.includes("super_admin");
    const targetRoleKeys = target.roles.map((item) => item.role.key);
    const targetIsSuperAdmin = targetRoleKeys.includes("super_admin");

    if (!actorIsSuperAdmin && targetIsSuperAdmin) {
      return NextResponse.json({ ok: false, message: "只有最高管理者可以調整最高管理者帳號。" }, { status: 403 });
    }

    if (session.userId === target.id && body.isActive === false) {
      return NextResponse.json({ ok: false, message: "不可停用自己的登入帳號。" }, { status: 400 });
    }

    if (target.isActive === body.isActive) {
      return NextResponse.json({ ok: true, userId: target.id, isActive: target.isActive });
    }

    await prisma.user.update({
      where: { id: target.id },
      data: { isActive: body.isActive },
    });

    await createAuditLog({
      actorUserId: session.userId,
      action: "admin.user.status.update",
      resourceType: "user",
      resourceId: target.id,
      payload: { isActive: body.isActive },
      ip: getClientIpFromRequest(req),
    });

    return NextResponse.json({ ok: true, userId: target.id, isActive: body.isActive });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "狀態資料格式錯誤。" }, { status: 400 });
    }

    return NextResponse.json({ ok: false, message: "更新會員狀態失敗。" }, { status: 500 });
  }
}
