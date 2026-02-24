import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SectionShell } from "@/components/ultra/section";
import { PhotographerDashboard } from "@/components/photographer/photographer-dashboard";
import { requirePageSession } from "@/lib/auth/page-guard";

export const metadata: Metadata = {
  title: "攝影師工作台",
  description: "查看被指派案件、上傳素材與更新專案狀態。",
};

export const dynamic = "force-dynamic";

export default async function PhotographerPage() {
  const session = await requirePageSession(["photographer", "admin", "super_admin"], "/photographer");

  return (
    <PageShell path="/photographer">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <PhotographerDashboard sessionName={session.name} sessionRoles={session.roles} />
      </SectionShell>
    </PageShell>
  );
}
