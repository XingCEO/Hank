"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Filter,
  FolderKanban,
  Images,
  LockKeyhole,
  RefreshCcw,
  Search,
  ShieldCheck,
  Truck,
  UserCog,
  Users,
  UserX,
} from "lucide-react";
import { PremiumCard } from "@/components/ultra/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROJECT_STATUSES, type ProjectStatusKey, type RoleKey } from "@/lib/auth/constants";
import { canAccessDashboardPath, ROLE_LEVEL_ORDER_DESC, ROLE_POLICY } from "@/lib/auth/policy";
import { MEMBERSHIP_LABEL, MEMBERSHIP_TIERS, type MembershipTier } from "@/lib/auth/membership";
import { cn } from "@/lib/utils";

type AdminDashboardProps = {
  currentUserId: string;
  currentUserName: string;
  currentUserRoles: RoleKey[];
};

type AdminUser = {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  roles: RoleKey[];
  membershipTier: MembershipTier;
};

type AuditActor = {
  id: string;
  name: string;
  email: string;
};

type AuditLogEntry = {
  id: string;
  actorUserId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  payloadJson: unknown;
  ip: string | null;
  createdAt: string;
  actor: AuditActor | null;
};

type ProjectStatusBreakdownItem = {
  status: ProjectStatusKey;
  count: number;
};

type AdminKpi = {
  totalUsers: number;
  totalProjects: number;
  totalAssets: number;
  totalDeliveries: number;
  projectStatusBreakdown: ProjectStatusBreakdownItem[];
};

type UsersResponse = {
  ok: boolean;
  users?: AdminUser[];
  message?: string;
};

type AuditLogsResponse = {
  ok: boolean;
  logs?: AuditLogEntry[];
  message?: string;
};

type KpiResponse = {
  ok: boolean;
  kpi?: AdminKpi;
  message?: string;
};

type PatchRolesResponse = {
  ok: boolean;
  userId?: string;
  roles?: RoleKey[];
  message?: string;
};

type PatchUserStatusResponse = {
  ok: boolean;
  userId?: string;
  isActive?: boolean;
  message?: string;
};

type PatchMembershipResponse = {
  ok: boolean;
  userId?: string;
  tier?: MembershipTier;
  message?: string;
};

type PatchPasswordResponse = {
  ok: boolean;
  userId?: string;
  message?: string;
};

type RoleFilter = "all" | RoleKey;
type ActiveFilter = "all" | "active" | "inactive";
type MembershipFilter = "all" | MembershipTier;

const ROLE_ASSIGNMENT_ORDER: RoleKey[] = [...ROLE_LEVEL_ORDER_DESC].reverse();

const ROLE_LABEL: Record<RoleKey, string> = Object.fromEntries(
  ROLE_LEVEL_ORDER_DESC.map((role) => [role, ROLE_POLICY[role].label]),
) as Record<RoleKey, string>;

const ROLE_HINT: Record<RoleKey, string> = Object.fromEntries(
  ROLE_LEVEL_ORDER_DESC.map((role) => [role, ROLE_POLICY[role].description]),
) as Record<RoleKey, string>;

const ACCESS_TEST_ROUTES = ["/portal", "/photographer", "/admin"] as const;

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return value;
  }

  const diffMinutes = Math.round((date.getTime() - Date.now()) / 60000);
  const rtf = new Intl.RelativeTimeFormat("zh-TW", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
}

function orderedRoles(roles: RoleKey[]): RoleKey[] {
  return ROLE_ASSIGNMENT_ORDER.filter((role) => roles.includes(role));
}

function roleSetEquals(left: RoleKey[], right: RoleKey[]): boolean {
  const leftOrdered = orderedRoles(left);
  const rightOrdered = orderedRoles(right);

  if (leftOrdered.length !== rightOrdered.length) {
    return false;
  }

  return leftOrdered.every((role, index) => role === rightOrdered[index]);
}

function getPrimaryRole(roles: RoleKey[]): RoleKey {
  for (const role of ROLE_LEVEL_ORDER_DESC) {
    if (roles.includes(role)) {
      return role;
    }
  }
  return "customer";
}

async function requestJson<T extends { ok?: boolean; message?: string }>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);
  let payload: T | null = null;

  try {
    payload = (await response.json()) as T;
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.ok === false) {
    const message = payload?.message ?? `請求失敗（${response.status}）`;
    throw new Error(message);
  }

  if (!payload) {
    throw new Error("伺服器回應為空。");
  }

  return payload;
}

function getRoleChipClass(role: RoleKey): string {
  switch (role) {
    case "customer":
      return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-200";
    case "photographer":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200";
    case "admin":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200";
    case "super_admin":
      return "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-200";
    default:
      return "border-border bg-secondary/60 text-secondary-foreground";
  }
}

function getMembershipChipClass(tier: MembershipTier): string {
  switch (tier) {
    case "basic":
      return "border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-200";
    case "pro":
      return "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-200";
    case "ultra":
      return "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-200";
    default:
      return "border-border bg-secondary/60 text-secondary-foreground";
  }
}

export function AdminDashboard({ currentUserId, currentUserName, currentUserRoles }: AdminDashboardProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [kpi, setKpi] = useState<AdminKpi | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [membershipFilter, setMembershipFilter] = useState<MembershipFilter>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [draftRoles, setDraftRoles] = useState<RoleKey[]>([]);
  const [draftTier, setDraftTier] = useState<MembershipTier>("basic");

  const [resetPassword, setResetPassword] = useState("");
  const [selfCurrentPassword, setSelfCurrentPassword] = useState("");
  const [selfNewPassword, setSelfNewPassword] = useState("");

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingRoles, setIsSavingRoles] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingTier, setIsSavingTier] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isChangingOwnPassword, setIsChangingOwnPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  const isSuperAdmin = currentUserRoles.includes("super_admin");

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesKeyword =
        !keyword ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.id.toLowerCase().includes(keyword);
      const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter);
      const matchesActive =
        activeFilter === "all" || (activeFilter === "active" ? user.isActive : !user.isActive);
      const matchesMembership = membershipFilter === "all" || user.membershipTier === membershipFilter;

      return matchesKeyword && matchesRole && matchesActive && matchesMembership;
    });
  }, [activeFilter, membershipFilter, roleFilter, search, users]);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  const userSummary = useMemo(() => {
    const active = users.filter((user) => user.isActive).length;
    const inactive = users.length - active;
    const superAdmins = users.filter((user) => user.roles.includes("super_admin")).length;
    const basic = users.filter((user) => user.membershipTier === "basic").length;
    const pro = users.filter((user) => user.membershipTier === "pro").length;
    const ultra = users.filter((user) => user.membershipTier === "ultra").length;

    return { active, inactive, superAdmins, basic, pro, ultra };
  }, [users]);

  const rolePopulation = useMemo(() => {
    const map = new Map<RoleKey, number>();
    for (const role of ROLE_LEVEL_ORDER_DESC) {
      map.set(role, 0);
    }

    for (const user of users) {
      for (const role of user.roles) {
        map.set(role, (map.get(role) ?? 0) + 1);
      }
    }

    return map;
  }, [users]);

  const statusCountByKey = useMemo(() => {
    const map = new Map<ProjectStatusKey, number>();
    for (const key of PROJECT_STATUSES) {
      map.set(key, 0);
    }

    for (const item of kpi?.projectStatusBreakdown ?? []) {
      map.set(item.status, item.count);
    }

    return map;
  }, [kpi]);

  const totalStatusCount = useMemo(() => {
    let sum = 0;
    for (const key of PROJECT_STATUSES) {
      sum += statusCountByKey.get(key) ?? 0;
    }
    return sum;
  }, [statusCountByKey]);

  const selectedIsProtected = Boolean(selectedUser && !isSuperAdmin && selectedUser.roles.includes("super_admin"));
  const cannotDeactivateSelf = Boolean(selectedUser && selectedUser.id === currentUserId && selectedUser.isActive);
  const selectedIsSelf = Boolean(selectedUser && selectedUser.id === currentUserId);

  const roleSaveDisabled = useMemo(() => {
    if (!selectedUser || isSavingRoles || draftRoles.length === 0) {
      return true;
    }
    if (selectedIsProtected) {
      return true;
    }

    return roleSetEquals(draftRoles, selectedUser.roles);
  }, [draftRoles, isSavingRoles, selectedIsProtected, selectedUser]);

  const statusToggleDisabled = useMemo(() => {
    if (!selectedUser || isSavingStatus) {
      return true;
    }
    if (selectedIsProtected) {
      return true;
    }
    if (cannotDeactivateSelf) {
      return true;
    }

    return false;
  }, [cannotDeactivateSelf, isSavingStatus, selectedIsProtected, selectedUser]);

  const tierSaveDisabled = useMemo(() => {
    if (!selectedUser || isSavingTier) {
      return true;
    }
    if (selectedIsProtected) {
      return true;
    }

    return selectedUser.membershipTier === draftTier;
  }, [draftTier, isSavingTier, selectedIsProtected, selectedUser]);

  const resetPasswordDisabled = useMemo(() => {
    if (!selectedUser || isResettingPassword) {
      return true;
    }
    if (selectedIsProtected) {
      return true;
    }

    return resetPassword.trim().length < 8;
  }, [isResettingPassword, resetPassword, selectedIsProtected, selectedUser]);

  const changeOwnPasswordDisabled = useMemo(() => {
    if (!selectedIsSelf || isChangingOwnPassword) {
      return true;
    }

    return selfCurrentPassword.trim().length === 0 || selfNewPassword.trim().length < 8;
  }, [isChangingOwnPassword, selfCurrentPassword, selfNewPassword, selectedIsSelf]);

  const loadDashboard = async (mode: "initial" | "refresh") => {
    if (mode === "initial") {
      setIsInitialLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setErrorMessage("");

    try {
      const [usersResponse, logsResponse, kpiResponse] = await Promise.all([
        requestJson<UsersResponse>("/api/admin/users"),
        requestJson<AuditLogsResponse>("/api/admin/audit-logs"),
        requestJson<KpiResponse>("/api/admin/kpi/overview"),
      ]);

      setUsers(usersResponse.users ?? []);
      setLogs(logsResponse.logs ?? []);
      setKpi(kpiResponse.kpi ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "讀取管理後台資料失敗。";
      setErrorMessage(message);
    } finally {
      if (mode === "initial") {
        setIsInitialLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    void loadDashboard("initial");
  }, []);

  useEffect(() => {
    if (users.length === 0) {
      setSelectedUserId(null);
      return;
    }

    if (!selectedUserId || !users.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(users[0].id);
    }
  }, [selectedUserId, users]);

  useEffect(() => {
    if (!selectedUser) {
      setDraftRoles([]);
      setDraftTier("basic");
      setResetPassword("");
      setSelfCurrentPassword("");
      setSelfNewPassword("");
      return;
    }

    setDraftRoles(orderedRoles(selectedUser.roles));
    setDraftTier(selectedUser.membershipTier);
    setResetPassword("");
    setSelfCurrentPassword("");
    setSelfNewPassword("");
  }, [selectedUser]);

  const onToggleRole = (role: RoleKey) => {
    if (!selectedUser) {
      return;
    }
    if (selectedIsProtected) {
      return;
    }
    if (!isSuperAdmin && role === "super_admin") {
      return;
    }
    if (draftRoles.includes(role) && draftRoles.length === 1) {
      setErrorMessage("每個帳號至少要保留一個角色。");
      return;
    }

    setResultMessage("");
    setErrorMessage("");
    setDraftRoles((current) => {
      if (current.includes(role)) {
        return orderedRoles(current.filter((item) => item !== role));
      }

      return orderedRoles([...current, role]);
    });
  };

  const onApplyPreset = (roles: RoleKey[]) => {
    if (!selectedUser || selectedIsProtected) {
      return;
    }
    if (!isSuperAdmin && roles.includes("super_admin")) {
      return;
    }

    setResultMessage("");
    setErrorMessage("");
    setDraftRoles(orderedRoles(roles));
  };

  const onSaveRoles = async () => {
    if (!selectedUser || draftRoles.length === 0) {
      return;
    }

    setIsSavingRoles(true);
    setResultMessage("");
    setErrorMessage("");

    try {
      const roles = orderedRoles(draftRoles);

      await requestJson<PatchRolesResponse>(`/api/admin/users/${selectedUser.id}/roles`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles }),
      });

      await loadDashboard("refresh");
      setResultMessage(`已更新 ${selectedUser.name} 的角色：${roles.join("、")}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "更新角色失敗。";
      setErrorMessage(message);
    } finally {
      setIsSavingRoles(false);
    }
  };

  const onToggleUserActive = async () => {
    if (!selectedUser) {
      return;
    }

    const nextIsActive = !selectedUser.isActive;
    setIsSavingStatus(true);
    setResultMessage("");
    setErrorMessage("");

    try {
      await requestJson<PatchUserStatusResponse>(`/api/admin/users/${selectedUser.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextIsActive }),
      });

      await loadDashboard("refresh");
      setResultMessage(`${selectedUser.name} 已${nextIsActive ? "啟用" : "停用"}。`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "更新會員狀態失敗。";
      setErrorMessage(message);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const onSaveMembership = async () => {
    if (!selectedUser) {
      return;
    }

    setIsSavingTier(true);
    setResultMessage("");
    setErrorMessage("");

    try {
      await requestJson<PatchMembershipResponse>(`/api/admin/users/${selectedUser.id}/membership`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: draftTier }),
      });

      await loadDashboard("refresh");
      setResultMessage(`已更新 ${selectedUser.name} 的會員等級為 ${MEMBERSHIP_LABEL[draftTier]}。`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "更新會員等級失敗。";
      setErrorMessage(message);
    } finally {
      setIsSavingTier(false);
    }
  };

  const onResetPassword = async () => {
    if (!selectedUser) {
      return;
    }

    const password = resetPassword.trim();
    if (password.length < 8) {
      setErrorMessage("重設密碼至少 8 碼。");
      return;
    }

    setIsResettingPassword(true);
    setResultMessage("");
    setErrorMessage("");

    try {
      await requestJson<PatchPasswordResponse>(`/api/admin/users/${selectedUser.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });

      setResetPassword("");
      setResultMessage(`已重設 ${selectedUser.name} 的登入密碼。`);
      await loadDashboard("refresh");
    } catch (error) {
      const message = error instanceof Error ? error.message : "重設密碼失敗。";
      setErrorMessage(message);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const onChangeOwnPassword = async () => {
    if (!selectedIsSelf) {
      return;
    }

    setIsChangingOwnPassword(true);
    setResultMessage("");
    setErrorMessage("");

    try {
      await requestJson<{ ok: boolean; message?: string }>("/api/auth/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: selfCurrentPassword,
          newPassword: selfNewPassword,
        }),
      });

      setSelfCurrentPassword("");
      setSelfNewPassword("");
      setResultMessage("已更新目前登入帳號密碼。請妥善保存新密碼。");
      await loadDashboard("refresh");
    } catch (error) {
      const message = error instanceof Error ? error.message : "變更密碼失敗。";
      setErrorMessage(message);
    } finally {
      setIsChangingOwnPassword(false);
    }
  };

  const accessPreviewRoles = selectedUser ? draftRoles : currentUserRoles;

  return (
    <div className="mx-auto w-full max-w-[1540px] space-y-4 px-4 md:px-5 xl:px-6">
      <PremiumCard className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">後台管理中心</p>
            <h1 className="mt-2 text-3xl">會員與權限總控台</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              目前登入：{currentUserName}。可在此管理會員權限、會員等級與密碼。
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {orderedRoles(currentUserRoles).map((role) => (
                <span
                  key={`current-role-${role}`}
                  className={cn("rounded-full border px-2.5 py-1 text-xs", getRoleChipClass(role))}
                >
                  {ROLE_LABEL[role]}
                </span>
              ))}
            </div>
          </div>

          <Button
            onClick={() => void loadDashboard("refresh")}
            disabled={isInitialLoading || isRefreshing || isSavingRoles || isSavingStatus || isSavingTier}
          >
            <RefreshCcw className={cn("size-4", isRefreshing ? "animate-spin" : "")} />
            {isRefreshing ? "更新中" : "重新整理"}
          </Button>
        </div>

        {errorMessage ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}
        {resultMessage ? (
          <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-200">
            {resultMessage}
          </p>
        ) : null}
      </PremiumCard>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "會員總數", value: kpi?.totalUsers ?? users.length, icon: Users },
          { title: "專案總數", value: kpi?.totalProjects ?? 0, icon: FolderKanban },
          { title: "素材總數", value: kpi?.totalAssets ?? 0, icon: Images },
          { title: "交付總數", value: kpi?.totalDeliveries ?? 0, icon: Truck },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <PremiumCard key={item.title} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <span className="rounded-lg border border-border/40 bg-background/60 p-1.5">
                  <Icon className="size-4 text-primary" />
                </span>
              </div>
              <p className="text-3xl">{item.value}</p>
            </PremiumCard>
          );
        })}
      </div>

      <div className="grid gap-4 2xl:grid-cols-[1.55fr_1fr]">
        <PremiumCard className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">會員管理</p>
              <h2 className="mt-1.5 text-xl font-semibold">權限、等級、密碼</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              顯示 {filteredUsers.length} / {users.length} 位會員
            </p>
          </div>

          <div className="grid gap-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            <label className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜尋姓名、Email、會員 ID"
                className="pl-9"
              />
            </label>

            <label className="flex items-center gap-2 rounded-md border border-border/40 bg-background/40 px-2">
              <Filter className="size-4 text-muted-foreground" />
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
                className="h-9 w-full bg-transparent text-sm outline-none"
              >
                <option value="all">全部角色</option>
                {ROLE_LEVEL_ORDER_DESC.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABEL[role]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-md border border-border/40 bg-background/40 px-2">
              <Activity className="size-4 text-muted-foreground" />
              <select
                value={activeFilter}
                onChange={(event) => setActiveFilter(event.target.value as ActiveFilter)}
                className="h-9 w-full bg-transparent text-sm outline-none"
              >
                <option value="all">全部狀態</option>
                <option value="active">啟用中</option>
                <option value="inactive">停用中</option>
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-md border border-border/40 bg-background/40 px-2">
              <UserCog className="size-4 text-muted-foreground" />
              <select
                value={membershipFilter}
                onChange={(event) => setMembershipFilter(event.target.value as MembershipFilter)}
                className="h-9 w-full bg-transparent text-sm outline-none"
              >
                <option value="all">全部等級</option>
                {MEMBERSHIP_TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {MEMBERSHIP_LABEL[tier]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.05fr_1fr]">
            <div className="max-h-[40rem] space-y-2 overflow-y-auto pr-1">
              {isInitialLoading ? (
                <p className="text-sm text-muted-foreground">會員資料讀取中...</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">找不到符合條件的會員。</p>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserId === user.id;
                  const primaryRole = getPrimaryRole(user.roles);

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUserId(user.id)}
                      className={cn(
                        "w-full rounded-xl border px-3.5 py-3 text-left transition-colors",
                        isSelected
                          ? "border-primary/60 bg-primary/10"
                          : "border-border/40 bg-background/35 hover:bg-secondary/45",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[11px]",
                            user.isActive
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                              : "border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-200",
                          )}
                        >
                          {user.isActive ? "啟用" : "停用"}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", getRoleChipClass(primaryRole))}>
                          主要：{ROLE_LABEL[primaryRole]}
                        </span>
                        <span
                          className={cn("rounded-full border px-2 py-0.5 text-[11px]", getMembershipChipClass(user.membershipTier))}
                        >
                          等級：{MEMBERSHIP_LABEL[user.membershipTier]}
                        </span>
                        {orderedRoles(user.roles).map((role) => (
                          <span key={`${user.id}-${role}`} className="rounded-full border border-border/40 px-2 py-0.5 text-[11px]">
                            {ROLE_LABEL[role]}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <div className="rounded-xl border border-border/40 bg-background/35 p-3.5">
              {!selectedUser ? (
                <p className="text-sm text-muted-foreground">請先選取左側會員以編輯設定。</p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground">建立時間：{formatDateTime(selectedUser.createdAt)}</p>
                  </div>

                  {selectedIsProtected ? (
                    <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-200">
                      這是最高管理者帳號。你目前權限不足，無法修改其資料。
                    </p>
                  ) : null}

                  {cannotDeactivateSelf ? (
                    <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-200">
                      不能停用自己目前登入中的帳號。
                    </p>
                  ) : null}

                  <div className="rounded-xl border border-border/40 bg-background/55 p-3">
                    <p className="text-[0.7rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">帳號狀態</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-xs",
                          selectedUser.isActive
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                            : "border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-200",
                        )}
                      >
                        {selectedUser.isActive ? "目前為啟用" : "目前為停用"}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => void onToggleUserActive()} disabled={statusToggleDisabled}>
                        {isSavingStatus ? "處理中" : selectedUser.isActive ? "停用帳號" : "啟用帳號"}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/55 p-3">
                    <p className="text-[0.7rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">會員等級</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                      <select
                        value={draftTier}
                        onChange={(event) => setDraftTier(event.target.value as MembershipTier)}
                        className="h-9 w-full rounded-md border border-border/40 bg-background/70 px-2 text-sm outline-none"
                        disabled={selectedIsProtected}
                      >
                        {MEMBERSHIP_TIERS.map((tier) => (
                          <option key={tier} value={tier}>
                            {MEMBERSHIP_LABEL[tier]}
                          </option>
                        ))}
                      </select>
                      <Button size="sm" onClick={() => void onSaveMembership()} disabled={tierSaveDisabled}>
                        {isSavingTier ? "儲存中" : "儲存等級"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[0.7rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">角色設定</p>
                    {ROLE_LEVEL_ORDER_DESC.map((role) => {
                      const checked = draftRoles.includes(role);
                      const disabled = selectedIsProtected || (!isSuperAdmin && role === "super_admin");

                      return (
                        <label
                          key={role}
                          className={cn(
                            "flex gap-3 rounded-lg border border-border/40 px-3 py-2",
                            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-secondary/45",
                          )}
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 accent-primary"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => onToggleRole(role)}
                          />
                          <span>
                            <span className="block text-sm font-medium">{ROLE_LABEL[role]}</span>
                            <span className="block text-xs text-muted-foreground">{ROLE_HINT[role]}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[0.7rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">快速套用</p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => onApplyPreset(["customer"])} disabled={selectedIsProtected}>
                        一般會員
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onApplyPreset(["customer", "photographer"])}
                        disabled={selectedIsProtected}
                      >
                        攝影師
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onApplyPreset(["customer", "admin"])}
                        disabled={selectedIsProtected}
                      >
                        管理員
                      </Button>
                      {isSuperAdmin ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onApplyPreset(["customer", "admin", "super_admin"])}
                          disabled={selectedIsProtected}
                        >
                          最高管理者
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/55 p-3">
                    <p className="text-[0.7rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">路由權限預覽</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      {ACCESS_TEST_ROUTES.map((path) => {
                        const allowed = canAccessDashboardPath(accessPreviewRoles, path);
                        return (
                          <div key={path} className="rounded-lg border border-border/40 bg-background/70 px-2.5 py-2">
                            <p className="text-xs font-medium">{path}</p>
                            <p
                              className={cn(
                                "mt-1 text-xs",
                                allowed
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "text-zinc-600 dark:text-zinc-400",
                              )}
                            >
                              {allowed ? "可存取" : "不可存取"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/55 p-3">
                    <p className="text-[0.7rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">管理員重設密碼</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                      <Input
                        value={resetPassword}
                        onChange={(event) => setResetPassword(event.target.value)}
                        type="password"
                        placeholder="輸入新密碼（至少 8 碼）"
                        disabled={selectedIsProtected}
                      />
                      <Button size="sm" onClick={() => void onResetPassword()} disabled={resetPasswordDisabled}>
                        {isResettingPassword ? "重設中" : "重設密碼"}
                      </Button>
                    </div>
                  </div>

                  {selectedIsSelf ? (
                    <div className="rounded-xl border border-border/40 bg-background/55 p-3">
                      <p className="text-[0.7rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">變更自己的密碼</p>
                      <div className="mt-2 grid gap-2">
                        <Input
                          value={selfCurrentPassword}
                          onChange={(event) => setSelfCurrentPassword(event.target.value)}
                          type="password"
                          placeholder="目前密碼"
                        />
                        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                          <Input
                            value={selfNewPassword}
                            onChange={(event) => setSelfNewPassword(event.target.value)}
                            type="password"
                            placeholder="新密碼（至少 8 碼）"
                          />
                          <Button size="sm" onClick={() => void onChangeOwnPassword()} disabled={changeOwnPasswordDisabled}>
                            {isChangingOwnPassword ? "更新中" : "更新我的密碼"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {draftRoles.length === 0 ? (
                    <p className="inline-flex items-center gap-1 text-xs text-destructive">
                      <AlertTriangle className="size-3.5" />
                      每個帳號至少要保留一個角色。
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => void onSaveRoles()} disabled={roleSaveDisabled}>
                      {isSavingRoles ? "儲存中" : "儲存角色變更"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => selectedUser && setDraftRoles(orderedRoles(selectedUser.roles))}
                      disabled={isSavingRoles || !selectedUser || roleSetEquals(draftRoles, selectedUser.roles)}
                    >
                      還原
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PremiumCard>

        <div className="grid gap-4">
          <PremiumCard className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">角色階層</p>
                <h2 className="mt-1.5 text-xl font-semibold">權限分級</h2>
              </div>
              <LockKeyhole className="size-5 text-primary" />
            </div>

            <div className="space-y-2">
              {ROLE_LEVEL_ORDER_DESC.map((role) => (
                <div key={role} className="rounded-lg border border-border/40 bg-background/35 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      L{ROLE_POLICY[role].level} {ROLE_LABEL[role]}
                    </p>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", getRoleChipClass(role))}>
                      {rolePopulation.get(role) ?? 0} 人
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{ROLE_HINT[role]}</p>
                </div>
              ))}
            </div>
          </PremiumCard>

          <PremiumCard className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">專案狀態</p>
                <h2 className="mt-1.5 text-xl font-semibold">流程分布</h2>
              </div>
              <ShieldCheck className="size-5 text-primary" />
            </div>

            <div className="space-y-2">
              {PROJECT_STATUSES.map((status) => {
                const count = statusCountByKey.get(status) ?? 0;
                const ratio = totalStatusCount > 0 ? Math.round((count / totalStatusCount) * 100) : 0;

                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{status}</span>
                      <span className="text-muted-foreground">
                        {count}（{ratio}%）
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary/70">
                      <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${ratio}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </PremiumCard>

          <PremiumCard className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">稽核紀錄</p>
                <h2 className="mt-1.5 text-xl font-semibold">最近 200 筆</h2>
              </div>
              <Activity className="size-5 text-primary" />
            </div>

            <div className="max-h-[21rem] overflow-y-auto rounded-xl border border-border/40 bg-background/35">
              {isInitialLoading ? (
                <p className="p-4 text-sm text-muted-foreground">讀取中...</p>
              ) : logs.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">目前沒有稽核紀錄。</p>
              ) : (
                <div className="divide-y divide-border/40">
                  {logs.map((log) => (
                    <article key={log.id} className="space-y-1 px-4 py-3 text-sm">
                      <p className="font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        操作者：{log.actor?.name ?? "System"}｜資源：{log.resourceType}
                        {log.resourceId ? `:${log.resourceId}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(log.createdAt)}（{formatRelativeTime(log.createdAt)}）
                        {log.ip ? `｜IP ${log.ip}` : ""}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </PremiumCard>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <PremiumCard className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-emerald-600" />
            啟用會員
          </div>
          <p className="text-2xl">{userSummary.active}</p>
        </PremiumCard>
        <PremiumCard className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserX className="size-4 text-zinc-600" />
            停用會員
          </div>
          <p className="text-2xl">{userSummary.inactive}</p>
        </PremiumCard>
        <PremiumCard className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCog className="size-4 text-zinc-700" />
            Basic
          </div>
          <p className="text-2xl">{userSummary.basic}</p>
        </PremiumCard>
        <PremiumCard className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCog className="size-4 text-indigo-600" />
            Pro
          </div>
          <p className="text-2xl">{userSummary.pro}</p>
        </PremiumCard>
        <PremiumCard className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCog className="size-4 text-fuchsia-600" />
            Ultra
          </div>
          <p className="text-2xl">{userSummary.ultra}</p>
        </PremiumCard>
        <PremiumCard className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCog className="size-4 text-rose-600" />
            最高管理者
          </div>
          <p className="text-2xl">{userSummary.superAdmins}</p>
        </PremiumCard>
      </div>
    </div>
  );
}
