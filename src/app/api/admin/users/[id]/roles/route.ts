import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles, requireSession } from "@/lib/auth/request";
import { ROLE_KEYS } from "@/lib/auth/constants";
import { ensureBaseRoles } from "@/lib/auth/roles";
import { createAuditLog } from "@/lib/audit";
import { getClientIpFromRequest, guardSameOrigin } from "@/lib/security/request-guard";

const patchRolesSchema = z.object({
  roles: z.array(z.enum(ROLE_KEYS)).min(1, "At least one role is required."),
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
    const body = patchRolesSchema.parse(await req.json());
    await ensureBaseRoles(prisma);

    const target = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
    if (!target) {
      return NextResponse.json({ ok: false, message: "Target user not found." }, { status: 404 });
    }

    const actorIsSuperAdmin = session.roles.includes("super_admin");
    const targetRoleKeys = target.roles.map((item) => item.role.key);
    const targetIsSuperAdmin = targetRoleKeys.includes("super_admin");
    const updateIncludesSuperAdmin = body.roles.includes("super_admin");
    if (!actorIsSuperAdmin && (targetIsSuperAdmin || updateIncludesSuperAdmin)) {
      return NextResponse.json(
        { ok: false, message: "Only super admins can manage super admin roles." },
        { status: 403 },
      );
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
      return NextResponse.json({ ok: false, message: "One or more roles are invalid." }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId: id } });
      await tx.userRole.createMany({
        data: roleRows.map((role: { id: number; key: string }) => ({
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
      ip: getClientIpFromRequest(req),
    });

    return NextResponse.json({ ok: true, userId: id, roles: body.roles });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "Invalid role payload." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "Failed to update user roles." }, { status: 500 });
  }
}
