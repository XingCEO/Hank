import { Prisma } from "@prisma/client";
import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles, requireSession } from "@/lib/auth/request";
import { hasRole } from "@/lib/auth/authorization";
import { generateProjectCode } from "@/lib/projects";
import { createAuditLog } from "@/lib/audit";
import { getClientIpFromRequest, guardSameOrigin } from "@/lib/security/request-guard";

const createProjectSchema = z.object({
  clientUserId: z.string().min(1, "clientUserId is required."),
  title: z.string().min(2, "Title must be at least 2 characters."),
  budget: z.number().int().positive().optional(),
  startAt: z.iso.datetime().optional(),
  endAt: z.iso.datetime().optional(),
});

export const runtime = "nodejs";

function parseTake(searchParams: URLSearchParams): number {
  const raw = Number(searchParams.get("take") ?? 30);
  if (!Number.isFinite(raw)) {
    return 30;
  }
  return Math.min(100, Math.max(1, Math.floor(raw)));
}

export async function GET(req: Request) {
  const auth = await requireSession();
  if ("response" in auth) {
    return auth.response;
  }

  const { session } = auth;
  const url = new URL(req.url);
  const take = parseTake(url.searchParams);
  const cursor = url.searchParams.get("cursor");

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
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      client: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
    take: take + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
  });

  const hasMore = projects.length > take;
  const page = hasMore ? projects.slice(0, take) : projects;
  const nextCursor = hasMore ? page[page.length - 1]?.id : null;

  return NextResponse.json({ ok: true, projects: page, pagination: { take, nextCursor } });
}

export async function POST(req: Request) {
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

  try {
    const body = createProjectSchema.parse(await req.json());

    const client = await prisma.user.findUnique({
      where: { id: body.clientUserId },
      select: { id: true, isActive: true },
    });
    if (!client || !client.isActive) {
      return NextResponse.json({ ok: false, message: "Client account is not available." }, { status: 400 });
    }

    const startAt = body.startAt ? new Date(body.startAt) : undefined;
    const endAt = body.endAt ? new Date(body.endAt) : undefined;
    if ((startAt && Number.isNaN(startAt.getTime())) || (endAt && Number.isNaN(endAt.getTime()))) {
      return NextResponse.json({ ok: false, message: "Invalid schedule date format." }, { status: 400 });
    }
    if (startAt && endAt && startAt > endAt) {
      return NextResponse.json({ ok: false, message: "endAt must be later than startAt." }, { status: 400 });
    }

    let project: { id: string; code: string; clientUserId: string } | null = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const created = await prisma.project.create({
          data: {
            code: generateProjectCode(),
            title: body.title.trim(),
            clientUserId: body.clientUserId,
            status: "lead",
            budget: body.budget,
            startAt,
            endAt,
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
          select: {
            id: true,
            code: true,
            clientUserId: true,
          },
        });

        project = created;
        break;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002" &&
          Array.isArray(error.meta?.target) &&
          error.meta?.target.includes("code")
        ) {
          continue;
        }
        throw error;
      }
    }

    if (!project) {
      return NextResponse.json({ ok: false, message: "Unable to allocate unique project code." }, { status: 503 });
    }

    await createAuditLog({
      actorUserId: session.userId,
      action: "project.create",
      resourceType: "project",
      resourceId: project.id,
      payload: {
        code: project.code,
        clientUserId: project.clientUserId,
      },
      ip: getClientIpFromRequest(req),
    });

    return NextResponse.json({ ok: true, project }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "Invalid project payload." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "Failed to create project." }, { status: 500 });
  }
}
