import type { RoleKey } from "@/lib/auth/constants";

type RolePolicy = {
  level: number;
  label: string;
  description: string;
  defaultDashboardPath: "/portal" | "/photographer" | "/admin";
};

export const ROLE_POLICY: Record<RoleKey, RolePolicy> = {
  customer: {
    level: 10,
    label: "一般會員",
    description: "可瀏覽會員入口與個人專案資訊。",
    defaultDashboardPath: "/portal",
  },
  photographer: {
    level: 30,
    label: "攝影師",
    description: "可查看被指派專案並更新專案狀態。",
    defaultDashboardPath: "/photographer",
  },
  admin: {
    level: 60,
    label: "管理員",
    description: "可進入管理後台，管理會員與監看系統數據。",
    defaultDashboardPath: "/admin",
  },
  super_admin: {
    level: 100,
    label: "最高管理者",
    description: "具完整最高權限，可管理所有角色與後台功能。",
    defaultDashboardPath: "/admin",
  },
};

export const ROLE_LEVEL_ORDER_DESC: RoleKey[] = ["super_admin", "admin", "photographer", "customer"];

export function hasAnyRole(userRoles: RoleKey[], requiredRoles: RoleKey[]): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}

export function getHighestRole(userRoles: RoleKey[]): RoleKey {
  for (const role of ROLE_LEVEL_ORDER_DESC) {
    if (userRoles.includes(role)) {
      return role;
    }
  }
  return "customer";
}

export function getDefaultDashboardPath(userRoles: RoleKey[]): "/portal" | "/photographer" | "/admin" {
  return ROLE_POLICY[getHighestRole(userRoles)].defaultDashboardPath;
}

export function canAccessDashboardPath(userRoles: RoleKey[], path: string): boolean {
  if (path.startsWith("/admin")) {
    return hasAnyRole(userRoles, ["admin", "super_admin"]);
  }

  if (path.startsWith("/photographer")) {
    return hasAnyRole(userRoles, ["photographer", "admin", "super_admin"]);
  }

  if (path.startsWith("/portal")) {
    return userRoles.length > 0;
  }

  return true;
}

export function normalizeNextPath(nextValue: string | null): string | null {
  if (!nextValue) {
    return null;
  }

  if (!nextValue.startsWith("/") || nextValue.startsWith("//")) {
    return null;
  }

  if (nextValue.startsWith("/auth")) {
    return null;
  }

  return nextValue;
}
