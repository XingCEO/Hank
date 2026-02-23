import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles, requireSession } from "@/lib/auth/request";
import { PROJECT_MEMBER_ROLES } from "@/lib/auth/constants";
import { createAuditLog } from "@/lib/audit";
import { getClientIpFromRequest, guardSameOrigin } from "@/lib/security/request-guard";

const addMemberSchema = z.object({
  userId: z.string().min(1, "userId is required."),
  roleOnProject: z.enum(PROJECT_MEMBER_ROLES),
});

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, context: RouteContext) {
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
    const body = addMemberSchema.parse(await req.json());

    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ ok: false, message: "Project not found." }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: body.userId },
      select: { id: true, isActive: true },
    });
    if (!user || !user.isActive) {
      return NextResponse.json({ ok: false, message: "Invalid member user." }, { status: 400 });
    }

    const member = await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: id,
          userId: body.userId,
        },
      },
      update: {
        roleOnProject: body.roleOnProject,
      },
      create: {
        projectId: id,
        userId: body.userId,
        roleOnProject: body.roleOnProject,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await createAuditLog({
      actorUserId: session.userId,
      action: "project.member.upsert",
      resourceType: "project_member",
      resourceId: member.id,
      payload: {
        projectId: id,
        userId: body.userId,
        roleOnProject: body.roleOnProject,
      },
      ip: getClientIpFromRequest(req),
    });

    return NextResponse.json({ ok: true, member });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "Invalid member payload." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "Failed to update project member." }, { status: 500 });
  }
}
