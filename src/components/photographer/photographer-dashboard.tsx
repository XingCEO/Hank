"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumCard } from "@/components/ultra/section";
import { PROJECT_STATUSES, type ProjectStatusKey, type RoleKey } from "@/lib/auth/constants";

type PhotographerDashboardProps = {
  sessionName: string;
  sessionRoles: RoleKey[];
};

type ProjectItem = {
  id: string;
  code: string;
  title: string;
  status: ProjectStatusKey;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  members: Array<{
    id: string;
    userId: string;
    roleOnProject: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
};

type ProjectsResponse = {
  ok: boolean;
  projects?: ProjectItem[];
  message?: string;
};

type PatchStatusResponse = {
  ok: boolean;
  message?: string;
};

type ProjectDetailsResponse = {
  ok: boolean;
  project?: {
    id: string;
    statusLogs: Array<{
      id: string;
      changedAt: string;
      fromStatus: string;
      toStatus: string;
      note: string | null;
    }>;
    assets: Array<{
      id: string;
      type: string;
      createdAt: string;
    }>;
  };
  message?: string;
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

export function PhotographerDashboard({ sessionName, sessionRoles }: PhotographerDashboardProps) {
  const searchParams = useSearchParams();
  const deniedFrom = searchParams.get("denied_from");

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [detailsByProjectId, setDetailsByProjectId] = useState<Record<string, ProjectDetailsResponse["project"]>>({});

  const [draftStatusByProjectId, setDraftStatusByProjectId] = useState<Record<string, ProjectStatusKey>>({});
  const [draftNoteByProjectId, setDraftNoteByProjectId] = useState<Record<string, string>>({});
  const [savingProjectIds, setSavingProjectIds] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  const openCount = useMemo(() => {
    return projects.filter((project) => !["delivered", "closed"].includes(project.status)).length;
  }, [projects]);

  const loadProjects = async (mode: "initial" | "refresh") => {
    if (mode === "initial") {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setErrorMessage("");

    try {
      const data = await requestJson<ProjectsResponse>("/api/projects?take=50");
      const nextProjects = data.projects ?? [];
      setProjects(nextProjects);

      const nextStatusDrafts: Record<string, ProjectStatusKey> = {};
      for (const project of nextProjects) {
        nextStatusDrafts[project.id] = project.status;
      }
      setDraftStatusByProjectId(nextStatusDrafts);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load projects.");
    } finally {
      if (mode === "initial") {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    void loadProjects("initial");
  }, []);

  const onStatusChange = (projectId: string, value: ProjectStatusKey) => {
    setDraftStatusByProjectId((current) => ({ ...current, [projectId]: value }));
    setResultMessage("");
  };

  const onNoteChange = (projectId: string, value: string) => {
    setDraftNoteByProjectId((current) => ({ ...current, [projectId]: value }));
  };

  const onRefreshDetails = async (projectId: string) => {
    try {
      const data = await requestJson<ProjectDetailsResponse>(`/api/projects/${projectId}`);
      setDetailsByProjectId((current) => ({ ...current, [projectId]: data.project ?? undefined }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load details.");
    }
  };

  const onUpdateStatus = async (project: ProjectItem) => {
    const toStatus = draftStatusByProjectId[project.id];
    if (!toStatus || toStatus === project.status) {
      return;
    }

    setSavingProjectIds((current) => [...current, project.id]);
    setErrorMessage("");
    setResultMessage("");

    try {
      await requestJson<PatchStatusResponse>(`/api/projects/${project.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus,
          note: draftNoteByProjectId[project.id]?.trim() || undefined,
        }),
      });

      setResultMessage(`已更新 ${project.title} 狀態為 ${toStatus}。`);
      setDraftNoteByProjectId((current) => ({ ...current, [project.id]: "" }));
      await loadProjects("refresh");
      await onRefreshDetails(project.id);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update status.");
    } finally {
      setSavingProjectIds((current) => current.filter((id) => id !== project.id));
    }
  };

  return (
    <div className="container-ultra grid gap-5">
      <PremiumCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">攝影師工作台</p>
            <h1 className="mt-2 text-3xl">執行面板</h1>
            <p className="mt-2 text-sm text-muted-foreground">登入者：{sessionName}（{sessionRoles.join(" / ")}）</p>
          </div>
          <Button onClick={() => void loadProjects("refresh")} disabled={isLoading || isRefreshing}>
            {isRefreshing ? "更新中..." : "刷新案件"}
          </Button>
        </div>

        {deniedFrom ? (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-200">
            你目前沒有 `{deniedFrom}` 的權限，已導回可用頁面。
          </p>
        ) : null}
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

      <div className="grid gap-5 md:grid-cols-3">
        <PremiumCard>
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">指派案件</p>
          <p className="mt-2 text-sm text-muted-foreground">可見案件總數</p>
          <p className="mt-3 text-3xl">{projects.length}</p>
        </PremiumCard>
        <PremiumCard>
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">進行中</p>
          <p className="mt-2 text-sm text-muted-foreground">尚未交付 / 結案</p>
          <p className="mt-3 text-3xl">{openCount}</p>
        </PremiumCard>
        <PremiumCard>
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">狀態更新</p>
          <p className="mt-2 text-sm text-muted-foreground">可直接呼叫 `PATCH /api/projects/:id/status`</p>
          <p className="mt-3 text-sm text-muted-foreground">每次更新都會寫入狀態紀錄與審計紀錄。</p>
        </PremiumCard>
      </div>

      <div className="grid gap-5">
        {isLoading ? (
          <PremiumCard>
            <p className="text-sm text-muted-foreground">載入案件中...</p>
          </PremiumCard>
        ) : projects.length === 0 ? (
          <PremiumCard>
            <p className="text-sm text-muted-foreground">目前沒有可操作案件。</p>
          </PremiumCard>
        ) : (
          projects.map((project) => {
            const draftStatus = draftStatusByProjectId[project.id] ?? project.status;
            const isSaving = savingProjectIds.includes(project.id);
            const details = detailsByProjectId[project.id];

            return (
              <PremiumCard key={project.id} className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">{project.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {project.code} | 客戶：{project.client.name}（{project.client.email}）
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      目前狀態：{project.status} | 更新時間：{formatDateTime(project.updatedAt)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => void onRefreshDetails(project.id)}>
                    刷新詳情
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
                  <label className="space-y-1">
                    <span className="text-xs text-muted-foreground">下一狀態</span>
                    <select
                      value={draftStatus}
                      onChange={(event) => onStatusChange(project.id, event.target.value as ProjectStatusKey)}
                      className="h-9 w-full rounded-md border border-border/40 bg-background/30 px-2 text-sm"
                    >
                      {PROJECT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-xs text-muted-foreground">備註（選填）</span>
                    <Input
                      value={draftNoteByProjectId[project.id] ?? ""}
                      onChange={(event) => onNoteChange(project.id, event.target.value)}
                      placeholder="例如：今日完成毛片交接"
                    />
                  </label>

                  <div className="flex items-end">
                    <Button
                      onClick={() => void onUpdateStatus(project)}
                      disabled={isSaving || draftStatus === project.status}
                    >
                      {isSaving ? "更新中..." : "更新狀態"}
                    </Button>
                  </div>
                </div>

                {details ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-border/40 bg-background/30 p-3">
                      <p className="text-sm font-medium">最新狀態紀錄</p>
                      <div className="mt-2 space-y-2">
                        {details.statusLogs.length === 0 ? (
                          <p className="text-xs text-muted-foreground">尚無狀態紀錄</p>
                        ) : (
                          details.statusLogs.slice(0, 4).map((log) => (
                            <p key={log.id} className="text-xs text-muted-foreground">
                              {formatDateTime(log.changedAt)} | {log.fromStatus} {"->"} {log.toStatus}
                              {log.note ? ` | ${log.note}` : ""}
                            </p>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/40 bg-background/30 p-3">
                      <p className="text-sm font-medium">最近素材</p>
                      <div className="mt-2 space-y-2">
                        {details.assets.length === 0 ? (
                          <p className="text-xs text-muted-foreground">尚無素材</p>
                        ) : (
                          details.assets.slice(0, 4).map((asset) => (
                            <p key={asset.id} className="text-xs text-muted-foreground">
                              {asset.type} | {formatDateTime(asset.createdAt)}
                            </p>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </PremiumCard>
            );
          })
        )}
      </div>
    </div>
  );
}
