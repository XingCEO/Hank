import type { PrismaClient } from "@prisma/client";
import type { RoleKey } from "@/lib/auth/constants";

const ROLE_LABELS: Record<RoleKey, string> = {
  customer: "客戶會員",
  photographer: "攝影師",
  admin: "管理員",
  super_admin: "超級管理員",
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
