"use client";

import { useEffect, useMemo, useState } from "react";
import { PremiumCard } from "@/components/ultra/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PROJECT_STATUSES, type ProjectStatusKey, type RoleKey } from "@/lib/auth/constants";

type AdminDashboardProps = {
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

const ROLE_ORDER: RoleKey[] = ["customer", "photographer", "admin", "super_admin"];

const ROLE_LABEL: Record<RoleKey, string> = {
  customer: "客戶",
  photographer: "攝影師",
  admin: "管理員",
  super_admin: "超級管理員",
};

const ROLE_HINT: Record<RoleKey, string> = {
  customer: "可查看自己案件與下載素材",
  photographer: "可更新案件狀態並上傳素材",
  admin: "可管理一般人員、案件與後台資料",
  super_admin: "可管理包含超管在內的所有角色",
};

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

function roleSetEquals(left: RoleKey[], right: RoleKey[]): boolean {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((role) => right.includes(role));
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
    const message = payload?.message ?? `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (!payload) {
    throw new Error("Unexpected empty response.");
  }

  return payload;
}

function getRoleChipClass(role: RoleKey): string {
  switch (role) {
    case "customer":
      return "border-sky-500/30 bg-sky-500/12 text-sky-700 dark:text-sky-200";
    case "photographer":
      return "border-amber-500/30 bg-amber-500/12 text-amber-700 dark:text-amber-200";
    case "admin":
      return "border-emerald-500/30 bg-emerald-500/12 text-emerald-700 dark:text-emerald-200";
    case "super_admin":
      return "border-rose-500/30 bg-rose-500/12 text-rose-700 dark:text-rose-200";
    default:
      return "border-border bg-secondary text-secondary-foreground";
  }
}

export function AdminDashboard({ currentUserName, currentUserRoles }: AdminDashboardProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [kpi, setKpi] = useState<AdminKpi | null>(null);

  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [draftRoles, setDraftRoles] = useState<RoleKey[]>([]);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingRoles, setIsSavingRoles] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  const isSuperAdmin = currentUserRoles.includes("super_admin");

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.id.toLowerCase().includes(keyword)
      );
    });
  }, [search, users]);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

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

  const roleSaveDisabled = useMemo(() => {
    if (!selectedUser || isSavingRoles || draftRoles.length === 0) {
      return true;
    }

    if (!isSuperAdmin && selectedUser.roles.includes("super_admin")) {
      return true;
    }

    return roleSetEquals(draftRoles, selectedUser.roles);
  }, [draftRoles, isSavingRoles, isSuperAdmin, selectedUser]);

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
      const message = error instanceof Error ? error.message : "Failed to load admin dashboard.";
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
      return;
    }
    setDraftRoles(selectedUser.roles);
  }, [selectedUser]);

  const onToggleRole = (role: RoleKey) => {
    if (!selectedUser) {
      return;
    }

    if (!isSuperAdmin && selectedUser.roles.includes("super_admin")) {
      return;
    }
    if (!isSuperAdmin && role === "super_admin") {
      return;
    }

    setResultMessage("");
    setDraftRoles((current) => {
      if (current.includes(role)) {
        return current.filter((item) => item !== role);
      }
      return [...current, role];
    });
  };

  const onSaveRoles = async () => {
    if (!selectedUser || draftRoles.length === 0) {
      return;
    }

    setIsSavingRoles(true);
    setResultMessage("");
    setErrorMessage("");

    try {
      const orderedRoles = ROLE_ORDER.filter((role) => draftRoles.includes(role));

      await requestJson<PatchRolesResponse>(`/api/admin/users/${selectedUser.id}/roles`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: orderedRoles }),
      });

      setResultMessage(`已更新 ${selectedUser.name} 的角色設定。`);
      await loadDashboard("refresh");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update user roles.";
      setErrorMessage(message);
    } finally {
      setIsSavingRoles(false);
    }
  };

  return (
    <div className="container-ultra grid gap-5">
      <PremiumCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.22em] text-primary uppercase">管理員後台</p>
            <h1 className="mt-2 text-3xl">營運控制台</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              目前登入者：{currentUserName}（{currentUserRoles.join(" / ")}）
            </p>
          </div>
          <Button onClick={() => void loadDashboard("refresh")} disabled={isInitialLoading || isRefreshing || isSavingRoles}>
            {isRefreshing ? "更新中..." : "重新整理資料"}
          </Button>
        </div>

        {errorMessage ? <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMessage}</p> : null}
        {resultMessage ? (
          <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-200">
            {resultMessage}
          </p>
        ) : null}
      </PremiumCard>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <PremiumCard className="space-y-2">
          <p className="text-xs tracking-[0.22em] text-primary uppercase">KPI</p>
          <p className="text-sm text-muted-foreground">總會員數</p>
          <p className="text-3xl">{kpi?.totalUsers ?? 0}</p>
        </PremiumCard>
        <PremiumCard className="space-y-2">
          <p className="text-xs tracking-[0.22em] text-primary uppercase">KPI</p>
          <p className="text-sm text-muted-foreground">總案件數</p>
          <p className="text-3xl">{kpi?.totalProjects ?? 0}</p>
        </PremiumCard>
        <PremiumCard className="space-y-2">
          <p className="text-xs tracking-[0.22em] text-primary uppercase">KPI</p>
          <p className="text-sm text-muted-foreground">總素材數</p>
          <p className="text-3xl">{kpi?.totalAssets ?? 0}</p>
        </PremiumCard>
        <PremiumCard className="space-y-2">
          <p className="text-xs tracking-[0.22em] text-primary uppercase">KPI</p>
          <p className="text-sm text-muted-foreground">總交付批次</p>
          <p className="text-3xl">{kpi?.totalDeliveries ?? 0}</p>
        </PremiumCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <PremiumCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.22em] text-primary uppercase">人員管理</p>
              <h2 className="mt-2 text-2xl">使用者角色設定</h2>
            </div>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜尋姓名、Email、ID"
              className="w-full md:w-72"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
              {isInitialLoading ? (
                <p className="text-sm text-muted-foreground">載入使用者資料中...</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">找不到符合條件的使用者。</p>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserId === user.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUserId(user.id)}
                      className={cn(
                        "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                        isSelected ? "border-primary/60 bg-primary/10" : "border-border/70 bg-background/30 hover:bg-secondary/40",
                      )}
                    >
                      <p className="font-medium">{user.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {user.roles.map((role) => (
                          <span
                            key={`${user.id}-${role}`}
                            className={cn("rounded-full border px-2 py-0.5 text-[11px]", getRoleChipClass(role))}
                          >
                            {ROLE_LABEL[role]}
                          </span>
                        ))}
                        {!user.isActive ? (
                          <span className="rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[11px] text-destructive">
                            已停用
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="rounded-xl border border-border/70 bg-background/30 p-4">
              {!selectedUser ? (
                <p className="text-sm text-muted-foreground">請先從左側選擇一位使用者。</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground">建立時間：{formatDateTime(selectedUser.createdAt)}</p>
                  </div>

                  {!isSuperAdmin && selectedUser.roles.includes("super_admin") ? (
                    <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-200">
                      你目前不是超級管理員，無法修改此帳號角色。
                    </p>
                  ) : null}

                  <div className="space-y-2">
                    {ROLE_ORDER.map((role) => {
                      const checked = draftRoles.includes(role);
                      const disabled = (!isSuperAdmin && role === "super_admin") || (!isSuperAdmin && selectedUser.roles.includes("super_admin"));

                      return (
                        <label
                          key={role}
                          className={cn(
                            "flex cursor-pointer gap-3 rounded-lg border border-border/70 px-3 py-2",
                            disabled ? "cursor-not-allowed opacity-60" : "hover:bg-secondary/40",
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

                  {draftRoles.length === 0 ? (
                    <p className="text-xs text-destructive">至少需要保留一個角色。</p>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => void onSaveRoles()} disabled={roleSaveDisabled}>
                      {isSavingRoles ? "儲存中..." : "儲存角色變更"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDraftRoles(selectedUser.roles)}
                      disabled={isSavingRoles || roleSetEquals(draftRoles, selectedUser.roles)}
                    >
                      還原
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PremiumCard>

        <div className="grid gap-5">
          <PremiumCard className="space-y-4">
            <div>
              <p className="text-xs tracking-[0.22em] text-primary uppercase">案件分布</p>
              <h2 className="mt-2 text-2xl">狀態統計</h2>
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
                        {count} ({ratio}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary/60">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </PremiumCard>

          <PremiumCard className="space-y-4">
            <div>
              <p className="text-xs tracking-[0.22em] text-primary uppercase">審計紀錄</p>
              <h2 className="mt-2 text-2xl">最近 200 筆操作</h2>
            </div>

            <div className="max-h-[28rem] overflow-y-auto rounded-xl border border-border/70 bg-background/30">
              {isInitialLoading ? (
                <p className="p-4 text-sm text-muted-foreground">載入審計紀錄中...</p>
              ) : logs.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">目前沒有審計紀錄。</p>
              ) : (
                <div className="divide-y divide-border/70">
                  {logs.map((log) => (
                    <div key={log.id} className="space-y-1 px-4 py-3 text-sm">
                      <p className="font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        操作者：{log.actor?.name ?? "System"} / 資源：{log.resourceType}
                        {log.resourceId ? `:${log.resourceId}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        時間：{formatDateTime(log.createdAt)}
                        {log.ip ? ` / IP: ${log.ip}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
}
