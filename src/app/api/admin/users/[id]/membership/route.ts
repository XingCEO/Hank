import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles, requireSession } from "@/lib/auth/request";
import {
  ensureMembershipRoles,
  MEMBERSHIP_ROLE_KEYS,
  MEMBERSHIP_TIERS,
  getMembershipRoleKey,
} from "@/lib/auth/membership";
import { createAuditLog } from "@/lib/audit";
import { getClientIpFromRequest, guardSameOrigin } from "@/lib/security/request-guard";

const patchMembershipSchema = z.object({
  tier: z.enum(MEMBERSHIP_TIERS),
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
    const body = patchMembershipSchema.parse(await req.json());
    await ensureMembershipRoles(prisma);

    const target = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
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
        { ok: false, message: "只有最高管理者可以調整最高管理者帳號。" },
        { status: 403 },
      );
    }

    const roleKey = getMembershipRoleKey(body.tier);
    const tierRole = await prisma.role.findUnique({
      where: { key: roleKey },
      select: { id: true },
    });
    if (!tierRole) {
      return NextResponse.json({ ok: false, message: "會員等級設定失敗。" }, { status: 500 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({
        where: {
          userId: id,
          role: {
            key: {
              in: [...MEMBERSHIP_ROLE_KEYS],
            },
          },
        },
      });

      await tx.userRole.create({
        data: {
          userId: id,
          roleId: tierRole.id,
        },
      });
    });

    await createAuditLog({
      actorUserId: session.userId,
      action: "admin.user.membership.update",
      resourceType: "user",
      resourceId: id,
      payload: { tier: body.tier },
      ip: getClientIpFromRequest(req),
    });

    return NextResponse.json({ ok: true, userId: id, tier: body.tier });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, message: error.issues[0]?.message ?? "會員等級資料格式錯誤。" },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: false, message: "更新會員等級失敗。" }, { status: 500 });
  }
}
