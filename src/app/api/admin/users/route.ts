import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles, requireSession } from "@/lib/auth/request";
import { normalizeRoleKeys } from "@/lib/auth/normalize";
import { ensureMembershipRoles, getMembershipTierFromRoleKeys } from "@/lib/auth/membership";
import { ensureBaseRoles } from "@/lib/auth/roles";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const auth = await requireSession();
  if ("response" in auth) {
    return auth.response;
  }

  const { session } = auth;
  const forbidden = requireRoles(session, ["admin", "super_admin"]);
  if (forbidden) {
    return forbidden;
  }

  await ensureBaseRoles(prisma);
  await ensureMembershipRoles(prisma);

  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "50", 10), 1), 100);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
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

  const hasMore = users.length > limit;
  const items = hasMore ? users.slice(0, limit) : users;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({
    ok: true,
    users: items.map((user: Record<string, unknown> & { roles: { role: { key: string } }[] }) => ({
      ...user,
      roles: normalizeRoleKeys(user.roles.map((item: { role: { key: string } }) => item.role.key)),
      membershipTier: getMembershipTierFromRoleKeys(user.roles.map((item: { role: { key: string } }) => item.role.key)),
    })),
    nextCursor,
    hasMore,
  });
}
