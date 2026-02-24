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

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      createdAt: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    users: users.map((user: Record<string, unknown> & { roles: { role: { key: string } }[] }) => ({
      ...user,
      roles: user.roles.map((item: { role: { key: string } }) => item.role.key),
    })),
  });
}
