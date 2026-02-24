import type { PrismaClient } from "@prisma/client";
import type { RoleKey } from "@/lib/auth/constants";

const ROLE_LABELS: Record<RoleKey, string> = {
  customer: "一般會員",
  photographer: "攝影師",
  admin: "管理員",
  super_admin: "最高管理者",
};

export async function ensureBaseRoles(prisma: PrismaClient) {
  await Promise.all(
    Object.entries(ROLE_LABELS).map(([key, name]) =>
      prisma.role.upsert({
        where: { key },
        update: { name },
        create: { key, name },
      }),
    ),
  );
}
