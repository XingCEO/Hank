import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles, requireSession } from "@/lib/auth/request";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireSession();
  if ("response" in auth) {
    return auth.response;
  }

  const { session } = auth;
  const forbidden = requireRoles(session, ["admin", "super_admin"]);
  if (forbidden) {
    return forbidden;
  }

  const [totalUsers, totalProjects, statusGroups, totalAssets, totalDeliveries] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.project.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    }),
    prisma.asset.count(),
    prisma.delivery.count(),
  ]);

  return NextResponse.json({
    ok: true,
    kpi: {
      totalUsers,
      totalProjects,
      totalAssets,
      totalDeliveries,
      projectStatusBreakdown: statusGroups.map((item: { status: string; _count: { status: number } }) => ({
        status: item.status,
        count: item._count.status,
      })),
    },
  });
}
