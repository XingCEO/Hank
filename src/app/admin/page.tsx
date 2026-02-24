import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SectionShell } from "@/components/ultra/section";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { requirePageSession } from "@/lib/auth/page-guard";

export const metadata: Metadata = {
  title: "管理後台",
  description: "會員權限管理、系統 KPI 與稽核紀錄總覽。",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requirePageSession(["admin", "super_admin"], "/admin");

  return (
    <PageShell path="/admin">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <AdminDashboard
          currentUserId={session.userId}
          currentUserName={session.name}
          currentUserRoles={session.roles}
        />
      </SectionShell>
    </PageShell>
  );
}
