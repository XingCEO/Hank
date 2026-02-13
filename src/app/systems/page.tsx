import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SafeImage } from "@/components/ui/safe-image";
import { MagneticButton } from "@/components/ultra/magnetic-button";
import { Reveal } from "@/components/ultra/reveal";
import { AmbientBackground, GoldDivider, LuxuryHeading, PremiumCard, SectionShell } from "@/components/ultra/section";
import { systemRows } from "@/lib/site-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "營運系統",
  description: "驅動銷售管線、排程與交付成果的營運架構。",
};

const automationRules = [
  "表單送出即建立 CRM 潛客並通知製片負責人",
  "合格潛客自動進入排程邀約與提醒序列",
  "合約簽署後同步觸發訂金收款與拍攝準備清單",
  "交付完成後啟動回饋蒐集與續約追蹤任務",
];

const reviewMetrics = [
  "各渠道合格諮詢數與來源結構",
  "諮詢至通話轉換率與平均回覆時效",
  "提案至簽約成交率與平均客單價",
  "交付準時率與修訂輪數控制",
];

export default function SystemsPage() {
  return (
    <PageShell path="/systems">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra relative grid items-end gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <AmbientBackground />
          <Reveal>
            <LuxuryHeading
              kicker="工作室營運堆疊"
              title="從諮詢到交付，每個階段皆精準量化"
              copy="這不只是作品展示，而是一套具備可量測產出、轉換率與交付品質的營運系統。"
            />
          </Reveal>

          <Reveal delay={0.08}>
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/30 p-3">
              <div className="relative overflow-hidden rounded-xl">
                <SafeImage
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1800&q=80"
                  alt="Studio Pro 營運系統"
                  width={1800}
                  height={1200}
                  className="h-[320px] w-full object-cover md:h-[380px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" />
                <div className="absolute right-5 bottom-5 left-5">
                  <p className="text-xs tracking-[0.24em] text-primary uppercase">Operation Stack</p>
                  <p className="mt-2 text-sm text-foreground/90 md:text-base">
                    每個模組皆有負責角色、執行節點與 KPI，確保長期穩定成長。
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra">
          <div className="mb-8">
            <GoldDivider />
          </div>
          <Reveal>
            <PremiumCard>
              <div className="grid grid-cols-1 gap-2 rounded-xl border border-border/70 bg-background/25 p-3 md:grid-cols-4">
                <div className="px-3 py-2 text-xs tracking-[0.18em] text-muted-foreground uppercase">模組</div>
                <div className="px-3 py-2 text-xs tracking-[0.18em] text-muted-foreground uppercase">技術堆疊</div>
                <div className="px-3 py-2 text-xs tracking-[0.18em] text-muted-foreground uppercase">負責人</div>
                <div className="px-3 py-2 text-xs tracking-[0.18em] text-muted-foreground uppercase">關鍵指標</div>
              </div>

              <div className="mt-3 space-y-2">
                {systemRows.map((row) => (
                  <div
                    key={row.module}
                    className="grid grid-cols-1 gap-2 rounded-xl border border-border/70 bg-secondary/20 p-3 text-sm md:grid-cols-4"
                  >
                    <div className="font-medium">{row.module}</div>
                    <div className="text-muted-foreground">{row.stack}</div>
                    <div className="text-muted-foreground">{row.owner}</div>
                    <div className="text-muted-foreground">{row.kpi}</div>
                  </div>
                ))}
              </div>
            </PremiumCard>
          </Reveal>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra grid gap-5 lg:grid-cols-2">
          <Reveal>
            <PremiumCard className="h-full">
              <p className="text-xs tracking-[0.22em] text-primary uppercase">自動化規則</p>
              <h3 className="mt-3 text-2xl">在幕後穩定運作的流程</h3>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {automationRules.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </PremiumCard>
          </Reveal>

          <Reveal delay={0.08}>
            <PremiumCard className="h-full">
              <p className="text-xs tracking-[0.22em] text-primary uppercase">每週複審節奏</p>
              <h3 className="mt-3 text-2xl">持續追蹤的核心數據</h3>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {reviewMetrics.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </PremiumCard>
          </Reveal>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra">
          <Reveal>
            <PremiumCard>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs tracking-[0.22em] text-primary uppercase">系統導入</p>
                  <h3 className="mt-2 text-2xl">需要把這套流程複製到你的團隊？</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    我們可提供顧問式導入，從表單、排程到交付規範，一次建立可擴展的內容生產流程。
                  </p>
                </div>
                <MagneticButton href="/booking">預約顧問會議</MagneticButton>
              </div>
            </PremiumCard>
          </Reveal>
        </div>
      </SectionShell>
    </PageShell>
  );
}
