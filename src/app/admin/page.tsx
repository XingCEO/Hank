import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SectionShell } from "@/components/ultra/section";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { requirePageSession } from "@/lib/auth/page-guard";

export const metadata: Metadata = {
  title: "管理員後台",
  description: "管理專案、人員角色、審計紀錄與 KPI 儀表板。",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requirePageSession(["admin", "super_admin"], "/admin");

  return (
    <PageShell path="/admin">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <AdminDashboard currentUserName={session.name} currentUserRoles={session.roles} />
      </SectionShell>
    </PageShell>
  );
}
