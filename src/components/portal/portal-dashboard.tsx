"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ultra/section";
import type { RoleKey } from "@/lib/auth/constants";

type PortalDashboardProps = {
  sessionName: string;
  sessionRoles: RoleKey[];
};

type ProjectListItem = {
  id: string;
  code: string;
  title: string;
  status: string;
  createdAt: string;
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

type ProjectAsset = {
  id: string;
  type: string;
  createdAt: string;
  mime: string;
};

type ProjectStatusLog = {
  id: string;
  fromStatus: string;
  toStatus: string;
  note: string | null;
  changedAt: string;
};

type ProjectDetails = {
  id: string;
  code: string;
  title: string;
  status: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  members: Array<{
    id: string;
    roleOnProject: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  statusLogs: ProjectStatusLog[];
  assets: ProjectAsset[];
  deliveries: Array<{ id: string; version: number; deliveredAt: string }>;
};

type ProjectListResponse = {
  ok: boolean;
  projects?: ProjectListItem[];
  message?: string;
};

type ProjectDetailsResponse = {
  ok: boolean;
  project?: ProjectDetails;
  message?: string;
};

type DownloadResponse = {
  ok: boolean;
  downloadUrl?: string;
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

export function PortalDashboard({ sessionName, sessionRoles }: PortalDashboardProps) {
  const searchParams = useSearchParams();
  const deniedFrom = searchParams.get("denied_from");

  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [details, setDetails] = useState<ProjectDetails | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [downloadingAssetId, setDownloadingAssetId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  const statusSummary = useMemo(() => {
    const map = new Map<string, number>();
    for (const project of projects) {
      map.set(project.status, (map.get(project.status) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [projects]);

  const loadProjects = async (mode: "initial" | "refresh") => {
    if (mode === "initial") {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setErrorMessage("");

    try {
      const data = await requestJson<ProjectListResponse>("/api/projects?take=50");
      const nextProjects = data.projects ?? [];
      setProjects(nextProjects);

      if (nextProjects.length === 0) {
        setSelectedProjectId(null);
        setDetails(null);
      } else if (!selectedProjectId || !nextProjects.some((item) => item.id === selectedProjectId)) {
        setSelectedProjectId(nextProjects[0].id);
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setDetails(null);
      return;
    }

    const loadDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const data = await requestJson<ProjectDetailsResponse>(`/api/projects/${selectedProjectId}`);
        setDetails(data.project ?? null);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load project details.");
        setDetails(null);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    void loadDetails();
  }, [selectedProjectId]);

  const onDownloadAsset = async (assetId: string) => {
    setDownloadingAssetId(assetId);
    setErrorMessage("");

    try {
      const data = await requestJson<DownloadResponse>(`/api/assets/${assetId}/presign-download`);
      if (!data.downloadUrl) {
        throw new Error("Download URL is not available.");
      }
      window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to prepare download.");
    } finally {
      setDownloadingAssetId(null);
    }
  };

  return (
    <div className="container-ultra grid gap-5">
      <PremiumCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">會員中心</p>
            <h1 className="mt-2 text-3xl">歡迎回來，{sessionName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">你的目前角色：{sessionRoles.join(" / ")}</p>
          </div>
          <Button onClick={() => void loadProjects("refresh")} disabled={isLoading || isRefreshing}>
            {isRefreshing ? "更新中..." : "重新整理案件"}
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
      </PremiumCard>

      <div className="grid gap-5 md:grid-cols-3">
        <PremiumCard>
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">概況</p>
          <p className="mt-2 text-sm text-muted-foreground">可查看案件總數</p>
          <p className="mt-3 text-3xl">{projects.length}</p>
        </PremiumCard>
        <PremiumCard>
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">最新狀態</p>
          <p className="mt-2 text-sm text-muted-foreground">案件狀態分布</p>
          <div className="mt-3 space-y-1 text-sm">
            {statusSummary.length === 0 ? (
              <p className="text-muted-foreground">尚無資料</p>
            ) : (
              statusSummary.slice(0, 3).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span>{status}</span>
                  <span>{count}</span>
                </div>
              ))
            )}
          </div>
        </PremiumCard>
        <PremiumCard>
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">資料刷新</p>
          <p className="mt-2 text-sm text-muted-foreground">即時讀取目前可見權限內案件</p>
          <p className="mt-3 text-sm text-muted-foreground">此頁資料來源：`GET /api/projects`、`GET /api/projects/:id`</p>
        </PremiumCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
        <PremiumCard className="space-y-3">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">我的案件</p>
          <h2 className="text-xl font-semibold">可存取清單</h2>
          <div className="max-h-[30rem] space-y-2 overflow-y-auto pr-1">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">載入案件中...</p>
            ) : projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">目前沒有可查看案件。</p>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                    selectedProjectId === project.id
                      ? "border-primary/60 bg-primary/10"
                      : "border-border/40 bg-background/30 hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{project.title}</p>
                    <span className="rounded-full border border-border/40 px-2 py-0.5 text-xs">{project.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {project.code} | 客戶：{project.client.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">更新：{formatDateTime(project.updatedAt)}</p>
                </button>
              ))
            )}
          </div>
        </PremiumCard>

        <PremiumCard className="space-y-3">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">案件詳情</p>
          <h2 className="text-xl font-semibold">選取後顯示</h2>

          {isLoadingDetails ? (
            <p className="text-sm text-muted-foreground">載入案件詳情中...</p>
          ) : !details ? (
            <p className="text-sm text-muted-foreground">請先選擇案件。</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/40 bg-background/30 p-3">
                <p className="font-medium">{details.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {details.code} | 狀態：{details.status}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  客戶：{details.client.name}（{details.client.email}）
                </p>
              </div>

              <div className="rounded-xl border border-border/40 bg-background/30 p-3">
                <p className="text-sm font-medium">最新狀態紀錄</p>
                <div className="mt-2 space-y-2">
                  {details.statusLogs.length === 0 ? (
                    <p className="text-xs text-muted-foreground">尚無狀態紀錄</p>
                  ) : (
                    details.statusLogs.slice(0, 4).map((log) => (
                      <div key={log.id} className="text-xs text-muted-foreground">
                        {formatDateTime(log.changedAt)} | {log.fromStatus} {"->"} {log.toStatus}
                        {log.note ? ` | ${log.note}` : ""}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border/40 bg-background/30 p-3">
                <p className="text-sm font-medium">可下載素材（最新 5 筆）</p>
                <div className="mt-2 space-y-2">
                  {details.assets.length === 0 ? (
                    <p className="text-xs text-muted-foreground">尚無素材</p>
                  ) : (
                    details.assets.slice(0, 5).map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          {asset.type} | {formatDateTime(asset.createdAt)}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void onDownloadAsset(asset.id)}
                          disabled={downloadingAssetId === asset.id}
                        >
                          {downloadingAssetId === asset.id ? "處理中..." : "下載"}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </PremiumCard>
      </div>
    </div>
  );
}
