import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { PremiumCard, SectionShell } from "@/components/ultra/section";
import { requirePageSession } from "@/lib/auth/page-guard";

export const metadata: Metadata = {
  title: "攝影師工作台",
  description: "查看被指派案件、上傳素材與更新專案狀態。",
};

export const dynamic = "force-dynamic";

export default async function PhotographerPage() {
  await requirePageSession(["photographer", "admin", "super_admin"]);

  return (
    <PageShell path="/photographer">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra grid gap-5 md:grid-cols-3">
          <PremiumCard>
            <p className="text-xs tracking-[0.22em] text-primary uppercase">任務清單</p>
            <h1 className="mt-3 text-2xl">我的拍攝案件</h1>
            <p className="mt-2 text-sm text-muted-foreground">GET `/api/projects` 會自動回傳你被指派的專案。</p>
          </PremiumCard>
          <PremiumCard>
            <p className="text-xs tracking-[0.22em] text-primary uppercase">素材上傳</p>
            <h2 className="mt-3 text-2xl">上傳工作流程</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              先呼叫 `POST /api/projects/:id/assets/presign-upload`，再上傳至 S3/R2，最後寫入 `POST /api/projects/:id/assets`。
            </p>
          </PremiumCard>
          <PremiumCard>
            <p className="text-xs tracking-[0.22em] text-primary uppercase">進度更新</p>
            <h2 className="mt-3 text-2xl">狀態流轉</h2>
            <p className="mt-2 text-sm text-muted-foreground">使用 `PATCH /api/projects/:id/status` 更新案件狀態與備註。</p>
          </PremiumCard>
        </div>
      </SectionShell>
    </PageShell>
  );
}
