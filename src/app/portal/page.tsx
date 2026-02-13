import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { PremiumCard, SectionShell } from "@/components/ultra/section";
import { requirePageSession } from "@/lib/auth/page-guard";

export const metadata: Metadata = {
  title: "會員中心",
  description: "查看你的專案進度、交付版本與下載入口。",
};

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const session = await requirePageSession();

  return (
    <PageShell path="/portal">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra grid gap-5">
          <PremiumCard>
            <p className="text-xs tracking-[0.22em] text-primary uppercase">會員中心</p>
            <h1 className="mt-3 text-3xl">歡迎回來，{session.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              你目前的角色：
              {session.roles.join(" / ")}
            </p>
          </PremiumCard>

          <div className="grid gap-5 md:grid-cols-3">
            <PremiumCard>
              <h2 className="text-xl">我的案件</h2>
              <p className="mt-2 text-sm text-muted-foreground">使用 `/api/projects` 取得你可查看的全部案件清單。</p>
            </PremiumCard>
            <PremiumCard>
              <h2 className="text-xl">素材下載</h2>
              <p className="mt-2 text-sm text-muted-foreground">透過 `/api/assets/:id/presign-download` 取得短時效下載連結。</p>
            </PremiumCard>
            <PremiumCard>
              <h2 className="text-xl">帳號資訊</h2>
              <p className="mt-2 text-sm text-muted-foreground">可用 `/api/auth/me` 取得登入狀態與角色。</p>
            </PremiumCard>
          </div>

          <p className="text-sm text-muted-foreground">
            若要進入管理流程，請使用
            {" "}
            <Link href="/admin" className="underline decoration-primary/60 underline-offset-4">
              管理員後台
            </Link>
            {" "}
            或
            {" "}
            <Link href="/photographer" className="underline decoration-primary/60 underline-offset-4">
              攝影師工作台
            </Link>
            。
          </p>
        </div>
      </SectionShell>
    </PageShell>
  );
}
