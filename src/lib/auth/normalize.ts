import { isRoleKey, type RoleKey } from "@/lib/auth/constants";

export function normalizeRoleKeys(keys: string[]): RoleKey[] {
  const unique = Array.from(new Set(keys.filter(isRoleKey)));
  return unique.length > 0 ? unique : ["customer"];
}
