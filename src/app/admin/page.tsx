import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { PremiumCard, SectionShell } from "@/components/ultra/section";
import { requirePageSession } from "@/lib/auth/page-guard";

export const metadata: Metadata = {
  title: "管理員後台",
  description: "管理專案、人員角色、審計紀錄與 KPI 儀表板。",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requirePageSession(["admin", "super_admin"]);

  return (
    <PageShell path="/admin">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <PremiumCard>
            <p className="text-xs tracking-[0.22em] text-primary uppercase">案件</p>
            <h1 className="mt-3 text-2xl">專案管理</h1>
            <p className="mt-2 text-sm text-muted-foreground">GET/POST `/api/projects` 建立與管理全部案件。</p>
          </PremiumCard>
          <PremiumCard>
            <p className="text-xs tracking-[0.22em] text-primary uppercase">人員</p>
            <h2 className="mt-3 text-2xl">角色指派</h2>
            <p className="mt-2 text-sm text-muted-foreground">GET `/api/admin/users`，PATCH `/api/admin/users/:id/roles`。</p>
          </PremiumCard>
          <PremiumCard>
            <p className="text-xs tracking-[0.22em] text-primary uppercase">審計</p>
            <h2 className="mt-3 text-2xl">操作追蹤</h2>
            <p className="mt-2 text-sm text-muted-foreground">GET `/api/admin/audit-logs` 查看登入、指派、狀態更新等紀錄。</p>
          </PremiumCard>
          <PremiumCard>
            <p className="text-xs tracking-[0.22em] text-primary uppercase">KPI</p>
            <h2 className="mt-3 text-2xl">總覽儀表板</h2>
            <p className="mt-2 text-sm text-muted-foreground">GET `/api/admin/kpi/overview` 回傳案件狀態分布與總量指標。</p>
          </PremiumCard>
        </div>
      </SectionShell>
    </PageShell>
  );
}
