import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAccessProject, hasRole } from "@/lib/auth/authorization";
import { requireSession } from "@/lib/auth/request";
import { PROJECT_STATUSES } from "@/lib/auth/constants";
import { createAuditLog } from "@/lib/audit";
import { getClientIpFromRequest, guardSameOrigin } from "@/lib/security/request-guard";

const patchStatusSchema = z.object({
  toStatus: z.enum(PROJECT_STATUSES),
  note: z.string().max(500).optional(),
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
  const { id } = await context.params;

  const allowed = await canAccessProject(session, id);
  if (!allowed) {
    return NextResponse.json({ ok: false, message: "Forbidden." }, { status: 403 });
  }

  if (!hasRole(session, ["admin", "super_admin", "photographer"])) {
    return NextResponse.json({ ok: false, message: "Insufficient role permission." }, { status: 403 });
  }

  try {
    const body = patchStatusSchema.parse(await req.json());

    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!project) {
      return NextResponse.json({ ok: false, message: "Project not found." }, { status: 404 });
    }

    if (project.status === body.toStatus) {
      return NextResponse.json({ ok: true, projectStatus: project.status });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const nextProject = await tx.project.update({
        where: { id },
        data: { status: body.toStatus },
        select: { id: true, status: true },
      });

      await tx.projectStatusLog.create({
        data: {
          projectId: id,
          fromStatus: project.status,
          toStatus: body.toStatus,
          note: body.note,
          changedBy: session.userId,
        },
      });

      return nextProject;
    });

    await createAuditLog({
      actorUserId: session.userId,
      action: "project.status.update",
      resourceType: "project",
      resourceId: id,
      payload: {
        fromStatus: project.status,
        toStatus: body.toStatus,
      },
      ip: getClientIpFromRequest(req),
    });

    return NextResponse.json({ ok: true, project: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "Invalid status payload." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "Failed to update project status." }, { status: 500 });
  }
}
