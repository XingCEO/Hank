import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles, requireSession } from "@/lib/auth/request";
import { ROLE_KEYS } from "@/lib/auth/constants";
import { ensureBaseRoles } from "@/lib/auth/roles";
import { createAuditLog } from "@/lib/audit";
import { getRequestIp } from "@/lib/auth/request";

const patchRolesSchema = z.object({
  roles: z.array(z.enum(ROLE_KEYS)).min(1, "至少保留一個角色"),
});

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, context: RouteContext) {
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
    const body = patchRolesSchema.parse(await req.json());
    await ensureBaseRoles(prisma);

    const target = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!target) {
      return NextResponse.json({ ok: false, message: "找不到指定使用者" }, { status: 404 });
    }

    const roleRows = await prisma.role.findMany({
      where: {
        key: {
          in: body.roles,
        },
      },
      select: { id: true, key: true },
    });

    if (roleRows.length !== body.roles.length) {
      return NextResponse.json({ ok: false, message: "存在未定義的角色" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId: id } });
      await tx.userRole.createMany({
        data: roleRows.map((role) => ({
          userId: id,
          roleId: role.id,
        })),
      });
    });

    await createAuditLog({
      actorUserId: session.userId,
      action: "admin.user.roles.update",
      resourceType: "user",
      resourceId: id,
      payload: { roles: body.roles },
      ip: await getRequestIp(),
    });

    return NextResponse.json({ ok: true, userId: id, roles: body.roles });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "角色更新參數有誤" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "更新角色失敗" }, { status: 500 });
  }
}
