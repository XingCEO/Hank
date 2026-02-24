import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SectionShell } from "@/components/ultra/section";
import { PortalDashboard } from "@/components/portal/portal-dashboard";
import { requirePageSession } from "@/lib/auth/page-guard";

export const metadata: Metadata = {
  title: "會員中心",
  description: "查看你的專案進度、交付版本與下載入口。",
};

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const session = await requirePageSession(undefined, "/portal");

  return (
    <PageShell path="/portal">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <PortalDashboard sessionName={session.name} sessionRoles={session.roles} />
      </SectionShell>
    </PageShell>
  );
}
