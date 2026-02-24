import type { PrismaClient } from "@prisma/client";

export const MEMBERSHIP_TIERS = ["basic", "pro", "ultra"] as const;
export type MembershipTier = (typeof MEMBERSHIP_TIERS)[number];

export const MEMBERSHIP_ROLE_KEYS = ["tier_basic", "tier_pro", "tier_ultra"] as const;
type MembershipRoleKey = (typeof MEMBERSHIP_ROLE_KEYS)[number];

const TIER_TO_ROLE_KEY: Record<MembershipTier, MembershipRoleKey> = {
  basic: "tier_basic",
  pro: "tier_pro",
  ultra: "tier_ultra",
};

const ROLE_KEY_TO_TIER: Record<MembershipRoleKey, MembershipTier> = {
  tier_basic: "basic",
  tier_pro: "pro",
  tier_ultra: "ultra",
};

export const MEMBERSHIP_LABEL: Record<MembershipTier, string> = {
  basic: "Basic",
  pro: "Pro",
  ultra: "Ultra",
};

const MEMBERSHIP_ROLE_NAME: Record<MembershipRoleKey, string> = {
  tier_basic: "Membership Basic",
  tier_pro: "Membership Pro",
  tier_ultra: "Membership Ultra",
};

const MEMBERSHIP_PRIORITY: MembershipTier[] = ["ultra", "pro", "basic"];

export function isMembershipRoleKey(value: string): value is MembershipRoleKey {
  return (MEMBERSHIP_ROLE_KEYS as readonly string[]).includes(value);
}

export function getMembershipRoleKey(tier: MembershipTier): MembershipRoleKey {
  return TIER_TO_ROLE_KEY[tier];
}

export function getMembershipTierFromRoleKeys(roleKeys: string[]): MembershipTier {
  const matched: MembershipTier[] = [];
  for (const key of roleKeys) {
    if (isMembershipRoleKey(key)) {
      matched.push(ROLE_KEY_TO_TIER[key]);
    }
  }

  for (const tier of MEMBERSHIP_PRIORITY) {
    if (matched.includes(tier)) {
      return tier;
    }
  }

  return "basic";
}

export async function ensureMembershipRoles(prisma: PrismaClient) {
  await Promise.all(
    MEMBERSHIP_ROLE_KEYS.map((key) =>
      prisma.role.upsert({
        where: { key },
        update: { name: MEMBERSHIP_ROLE_NAME[key] },
        create: { key, name: MEMBERSHIP_ROLE_NAME[key] },
      }),
    ),
  );
}
