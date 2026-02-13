import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles, requireSession } from "@/lib/auth/request";
import { hasRole } from "@/lib/auth/authorization";
import { generateProjectCode } from "@/lib/projects";
import { createAuditLog } from "@/lib/audit";
import { getRequestIp } from "@/lib/auth/request";

const createProjectSchema = z.object({
  clientUserId: z.string().min(1, "請提供客戶 ID"),
  title: z.string().min(2, "專案名稱至少 2 字"),
  budget: z.number().int().positive().optional(),
  startAt: z.iso.datetime().optional(),
  endAt: z.iso.datetime().optional(),
});

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireSession();
  if ("response" in auth) {
    return auth.response;
  }

  const { session } = auth;
  const where = hasRole(session, ["admin", "super_admin"])
    ? {}
    : session.roles.includes("customer")
      ? { clientUserId: session.userId }
      : {
          members: {
            some: {
              userId: session.userId,
            },
          },
        };

  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
    take: 100,
  });

  return NextResponse.json({ ok: true, projects });
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if ("response" in auth) {
    return auth.response;
  }

  const { session } = auth;
  const forbidden = requireRoles(session, ["admin", "super_admin"]);
  if (forbidden) {
    return forbidden;
  }

  try {
    const body = createProjectSchema.parse(await req.json());

    const project = await prisma.project.create({
      data: {
        code: generateProjectCode(),
        title: body.title.trim(),
        clientUserId: body.clientUserId,
        status: "lead",
        budget: body.budget,
        startAt: body.startAt ? new Date(body.startAt) : undefined,
        endAt: body.endAt ? new Date(body.endAt) : undefined,
        createdBy: session.userId,
        members: {
          create: [
            {
              userId: session.userId,
              roleOnProject: "owner",
            },
          ],
        },
      },
    });

    await createAuditLog({
      actorUserId: session.userId,
      action: "project.create",
      resourceType: "project",
      resourceId: project.id,
      payload: {
        code: project.code,
        clientUserId: project.clientUserId,
      },
      ip: await getRequestIp(),
    });

    return NextResponse.json({ ok: true, project }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "資料格式錯誤" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "建立專案失敗" }, { status: 500 });
  }
}
