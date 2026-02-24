import { isRoleKey, type RoleKey } from "@/lib/auth/constants";

export function normalizeRoleKeys(keys: string[]): RoleKey[] {
  return Array.from(new Set(keys.filter(isRoleKey)));
}
