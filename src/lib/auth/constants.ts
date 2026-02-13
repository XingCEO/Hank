export const AUTH_COOKIE_NAME = "studio_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export const ROLE_KEYS = ["customer", "photographer", "admin", "super_admin"] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

export const PROJECT_STATUSES = ["lead", "quoted", "booked", "shooting", "post", "delivered", "closed"] as const;
export type ProjectStatusKey = (typeof PROJECT_STATUSES)[number];

export const PROJECT_MEMBER_ROLES = ["owner", "photographer", "retoucher", "producer"] as const;
export type ProjectMemberRoleKey = (typeof PROJECT_MEMBER_ROLES)[number];

export const ASSET_TYPES = ["raw", "edited", "cover", "document"] as const;
export type AssetTypeKey = (typeof ASSET_TYPES)[number];

export function isRoleKey(value: string): value is RoleKey {
  return (ROLE_KEYS as readonly string[]).includes(value);
}
