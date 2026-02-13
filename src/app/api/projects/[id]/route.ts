import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAccessProject } from "@/lib/auth/authorization";
import { requireSession } from "@/lib/auth/request";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const auth = await requireSession();
  if ("response" in auth) {
    return auth.response;
  }

  const { session } = auth;
  const { id } = await context.params;

  const allowed = await canAccessProject(session, id);
  if (!allowed) {
    return NextResponse.json({ ok: false, message: "無權限查看此專案" }, { status: 403 });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      schedules: true,
      statusLogs: {
        orderBy: {
          changedAt: "desc",
        },
        take: 30,
      },
      assets: {
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
      },
      deliveries: {
        orderBy: {
          deliveredAt: "desc",
        },
        include: {
          items: {
            include: { asset: true },
          },
        },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ ok: false, message: "找不到專案" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, project });
}
