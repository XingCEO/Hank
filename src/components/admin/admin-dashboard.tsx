"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Crown,
  Filter,
  FolderKanban,
  Images,
  RefreshCcw,
  Search,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { PremiumCard } from "@/components/ultra/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROJECT_STATUSES, type ProjectStatusKey, type RoleKey } from "@/lib/auth/constants";
import { canAccessDashboardPath, ROLE_LEVEL_ORDER_DESC, ROLE_POLICY } from "@/lib/auth/policy";
import { cn } from "@/lib/utils";

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

type RoleFilter = "all" | RoleKey;
type ActiveFilter = "all" | "active" | "inactive";

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

  return new Intl.DateTimeFormat("en-US", {
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
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

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

export function AdminDashboard({ currentUserName, currentUserRoles }: AdminDashboardProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [kpi, setKpi] = useState<AdminKpi | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
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

    return users.filter((user) => {
      const matchesKeyword =
        !keyword ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.id.toLowerCase().includes(keyword);
      const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter);
      const matchesActive =
        activeFilter === "all" || (activeFilter === "active" ? user.isActive : !user.isActive);

      return matchesKeyword && matchesRole && matchesActive;
    });
  }, [activeFilter, roleFilter, search, users]);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  const userSummary = useMemo(() => {
    const active = users.filter((user) => user.isActive).length;
    const inactive = users.length - active;
    const superAdmins = users.filter((user) => user.roles.includes("super_admin")).length;

    return { active, inactive, superAdmins };
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

  const roleSaveDisabled = useMemo(() => {
    if (!selectedUser || isSavingRoles || draftRoles.length === 0) {
      return true;
    }
    if (selectedIsProtected) {
      return true;
    }
    return roleSetEquals(draftRoles, selectedUser.roles);
  }, [draftRoles, isSavingRoles, selectedIsProtected, selectedUser]);

  const loadDashboard = async (mode: "initial" | "refresh") => {
    if (mode === "initial") {
      setIsInitialLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setErrorMessage("");
    setResultMessage("");

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
    setDraftRoles(orderedRoles(selectedUser.roles));
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
      setErrorMessage("Each account must keep at least one role.");
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

      setResultMessage(`Updated ${selectedUser.name} roles: ${roles.join(", ")}`);
      await loadDashboard("refresh");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update user roles.";
      setErrorMessage(message);
    } finally {
      setIsSavingRoles(false);
    }
  };

  const accessPreviewRoles = selectedUser ? draftRoles : currentUserRoles;

  return (
    <div className="container-ultra space-y-5">
      <section className="clean-surface clean-border relative overflow-hidden rounded-[1.55rem] p-[var(--space-phi-2)] md:p-[var(--space-phi-3)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.78_0.08_235_/_0.18),transparent_58%)]" />
        <div className="pointer-events-none absolute -top-28 -right-24 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs tracking-[0.28em] text-primary uppercase">Admin Command Center</p>
              <h1 className="text-3xl leading-tight md:text-4xl">Member, Role, and Audit Control</h1>
              <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                Signed in as <span className="font-medium text-foreground">{currentUserName}</span>. Keep access levels clean, verify every change, and monitor recent privileged actions from one place.
              </p>
              <div className="flex flex-wrap gap-2">
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

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void loadDashboard("refresh")} disabled={isInitialLoading || isRefreshing || isSavingRoles}>
                <RefreshCcw className={cn("size-4", isRefreshing ? "animate-spin" : "")} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/portal">
                  Portal
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/photographer">
                  Photographer
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
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

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-background/40 px-4 py-3">
              <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Directory</p>
              <p className="mt-2 text-2xl">{users.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {userSummary.active} active / {userSummary.inactive} inactive
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/40 px-4 py-3">
              <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Privileged</p>
              <p className="mt-2 text-2xl">{userSummary.superAdmins}</p>
              <p className="mt-1 text-xs text-muted-foreground">Accounts with super admin access</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/40 px-4 py-3">
              <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Recent Audit</p>
              <p className="mt-2 text-2xl">{logs.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Latest event {logs[0] ? formatRelativeTime(logs[0].createdAt) : "not available"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Users", value: kpi?.totalUsers ?? users.length, icon: Users },
          { label: "Projects", value: kpi?.totalProjects ?? 0, icon: FolderKanban },
          { label: "Assets", value: kpi?.totalAssets ?? 0, icon: Images },
          { label: "Deliveries", value: kpi?.totalDeliveries ?? 0, icon: Truck },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <PremiumCard key={item.label} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs tracking-[0.2em] text-primary uppercase">{item.label}</p>
                <span className="rounded-lg border border-border/70 bg-background/50 p-1.5">
                  <Icon className="size-4 text-primary" />
                </span>
              </div>
              <p className="text-3xl">{item.value}</p>
            </PremiumCard>
          );
        })}
      </div>

      <PremiumCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs tracking-[0.22em] text-primary uppercase">Role Hierarchy</p>
            <h2 className="mt-2 text-2xl">Permission Ladder</h2>
          </div>
          <p className="text-sm text-muted-foreground">Higher levels inherit lower-level dashboard access.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {ROLE_LEVEL_ORDER_DESC.map((role) => (
            <article key={role} className="rounded-xl border border-border/70 bg-background/35 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  L{ROLE_POLICY[role].level} {ROLE_LABEL[role]}
                </p>
                <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", getRoleChipClass(role))}>
                  {rolePopulation.get(role) ?? 0}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{ROLE_HINT[role]}</p>
            </article>
          ))}
        </div>
      </PremiumCard>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <PremiumCard className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.22em] text-primary uppercase">Member Directory</p>
              <h2 className="mt-2 text-2xl">Search, Filter, and Edit Roles</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} / {users.length} users
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr]">
            <label className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, or user id"
                className="pl-9"
              />
            </label>

            <label className="flex items-center gap-2 rounded-md border border-border/70 bg-background/40 px-2">
              <Filter className="size-4 text-muted-foreground" />
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
                className="h-9 w-full bg-transparent text-sm outline-none"
              >
                <option value="all">All roles</option>
                {ROLE_LEVEL_ORDER_DESC.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABEL[role]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-md border border-border/70 bg-background/40 px-2">
              <Activity className="size-4 text-muted-foreground" />
              <select
                value={activeFilter}
                onChange={(event) => setActiveFilter(event.target.value as ActiveFilter)}
                className="h-9 w-full bg-transparent text-sm outline-none"
              >
                <option value="all">All status</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <div className="max-h-[36rem] space-y-2 overflow-y-auto pr-1">
              {isInitialLoading ? (
                <p className="text-sm text-muted-foreground">Loading users...</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No user matches the current filters.</p>
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
                        "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                        isSelected
                          ? "border-primary/60 bg-primary/10"
                          : "border-border/70 bg-background/35 hover:bg-secondary/45",
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
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", getRoleChipClass(primaryRole))}>
                          Primary: {ROLE_LABEL[primaryRole]}
                        </span>
                        {orderedRoles(user.roles).map((role) => (
                          <span key={`${user.id}-${role}`} className="rounded-full border border-border/70 px-2 py-0.5 text-[11px]">
                            {ROLE_LABEL[role]}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <div className="rounded-xl border border-border/70 bg-background/35 p-4">
              {!selectedUser ? (
                <p className="text-sm text-muted-foreground">Select a user to inspect and edit role assignments.</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-medium">{selectedUser.name}</p>
                      {selectedUser.roles.includes("super_admin") ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-700 dark:text-rose-200">
                          <Crown className="size-3.5" />
                          Super Admin
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Created {formatDateTime(selectedUser.createdAt)}</p>
                  </div>

                  {selectedIsProtected ? (
                    <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-200">
                      This account includes super admin access. Only a super admin can modify these roles.
                    </p>
                  ) : null}

                  <div className="space-y-2">
                    {ROLE_LEVEL_ORDER_DESC.map((role) => {
                      const checked = draftRoles.includes(role);
                      const disabled = selectedIsProtected || (!isSuperAdmin && role === "super_admin");

                      return (
                        <label
                          key={role}
                          className={cn(
                            "flex gap-3 rounded-lg border border-border/70 px-3 py-2",
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
                    <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Quick Presets</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onApplyPreset(["customer"])}
                        disabled={selectedIsProtected}
                      >
                        Customer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onApplyPreset(["customer", "photographer"])}
                        disabled={selectedIsProtected}
                      >
                        Photographer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onApplyPreset(["customer", "admin"])}
                        disabled={selectedIsProtected}
                      >
                        Admin
                      </Button>
                      {isSuperAdmin ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onApplyPreset(["customer", "admin", "super_admin"])}
                          disabled={selectedIsProtected}
                        >
                          Super Admin
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-background/45 p-3">
                    <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Dashboard Access Preview</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      {ACCESS_TEST_ROUTES.map((path) => {
                        const allowed = canAccessDashboardPath(accessPreviewRoles, path);
                        return (
                          <div key={path} className="rounded-lg border border-border/70 bg-background/70 px-2.5 py-2">
                            <p className="text-xs font-medium">{path}</p>
                            <p
                              className={cn(
                                "mt-1 text-xs",
                                allowed
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "text-zinc-600 dark:text-zinc-400",
                              )}
                            >
                              {allowed ? "Accessible" : "Blocked"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {draftRoles.length === 0 ? (
                    <p className="inline-flex items-center gap-1 text-xs text-destructive">
                      <AlertTriangle className="size-3.5" />
                      At least one role is required.
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => void onSaveRoles()} disabled={roleSaveDisabled}>
                      {isSavingRoles ? "Saving..." : "Save Role Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => selectedUser && setDraftRoles(orderedRoles(selectedUser.roles))}
                      disabled={isSavingRoles || !selectedUser || roleSetEquals(draftRoles, selectedUser.roles)}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PremiumCard>

        <div className="grid gap-5">
          <PremiumCard className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs tracking-[0.22em] text-primary uppercase">Project Pipeline</p>
                <h2 className="mt-2 text-2xl">Status Distribution</h2>
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
                        {count} ({ratio}%)
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

          <PremiumCard className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs tracking-[0.22em] text-primary uppercase">Audit Timeline</p>
                <h2 className="mt-2 text-2xl">Latest 200 Events</h2>
              </div>
              <Activity className="size-5 text-primary" />
            </div>

            <div className="max-h-[30rem] overflow-y-auto rounded-xl border border-border/70 bg-background/35">
              {isInitialLoading ? (
                <p className="p-4 text-sm text-muted-foreground">Loading logs...</p>
              ) : logs.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No audit logs available.</p>
              ) : (
                <div className="divide-y divide-border/70">
                  {logs.map((log) => (
                    <article key={log.id} className="space-y-1 px-4 py-3 text-sm">
                      <p className="font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        Actor: {log.actor?.name ?? "System"} | Resource: {log.resourceType}
                        {log.resourceId ? `:${log.resourceId}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(log.createdAt)} ({formatRelativeTime(log.createdAt)})
                        {log.ip ? ` | IP ${log.ip}` : ""}
                      </p>
                    </article>
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
