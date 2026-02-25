export const AUTH_COOKIE_NAME = "studio_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export const ROLE_KEYS = ["customer", "photographer", "admin", "super_admin"] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

export const PROJECT_STATUSES = ["lead", "quoted", "booked", "shooting", "post", "delivered", "closed"] as const;
export type ProjectStatusKey = (typeof PROJECT_STATUSES)[number];

/** Valid state transitions: key = fromStatus, value = allowed toStatuses */
export const PROJECT_STATUS_TRANSITIONS: Record<ProjectStatusKey, readonly ProjectStatusKey[]> = {
  lead: ["quoted", "closed"],
  quoted: ["booked", "lead", "closed"],
  booked: ["shooting", "closed"],
  shooting: ["post", "closed"],
  post: ["delivered", "shooting", "closed"],
  delivered: ["closed"],
  closed: ["lead"],
};

export function isValidStatusTransition(from: ProjectStatusKey, to: ProjectStatusKey): boolean {
  return (PROJECT_STATUS_TRANSITIONS[from] as readonly string[]).includes(to);
}

/** Allowed MIME types for asset uploads */
export const ALLOWED_ASSET_MIME_PREFIXES = ["image/", "video/", "application/pdf"] as const;

export function isAllowedAssetMime(mime: string): boolean {
  const lower = mime.toLowerCase().trim();
  return ALLOWED_ASSET_MIME_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

export const PROJECT_MEMBER_ROLES = ["owner", "photographer", "retoucher", "producer"] as const;
export type ProjectMemberRoleKey = (typeof PROJECT_MEMBER_ROLES)[number];

export const ASSET_TYPES = ["raw", "edited", "cover", "document"] as const;
export type AssetTypeKey = (typeof ASSET_TYPES)[number];

export function isRoleKey(value: string): value is RoleKey {
  return (ROLE_KEYS as readonly string[]).includes(value);
}
