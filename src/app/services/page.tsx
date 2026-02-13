import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SafeImage } from "@/components/ui/safe-image";
import { MagneticButton } from "@/components/ultra/magnetic-button";
import { Reveal, StaggerReveal } from "@/components/ultra/reveal";
import { AmbientBackground, GoldDivider, LuxuryHeading, PremiumCard, SectionShell } from "@/components/ultra/section";
import { serviceCards } from "@/lib/site-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "尊榮服務",
  description: "頂級攝影服務——從企劃到交付，一站式完成的專業製作系統。",
};

const addOns = [
  {
    title: "短影音加值",
    detail: "拍攝當日同步擷取可剪輯素材，提供 Reels / Shorts 優先上稿版本。",
  },
  {
    title: "造型與場景統籌",
    detail: "造型顧問與場景道具清單同步管理，確保視覺語言一致。",
  },
  {
    title: "跨城市拍攝支援",
    detail: "提供外縣市與海外拍攝班底調度、交通住宿與風險備案。",
  },
  {
    title: "公關素材包",
    detail: "依新聞媒體規格輸出，附上可直接轉交 PR 團隊的檔案結構。",
  },
];

const qualityAssurances = [
  "4 小時內回覆新諮詢，重要專案可進入快速通道",
  "24 小時內提供第一版製作提案與時程框架",
  "每個專案皆提供可追溯版本紀錄與交付清單",
  "專屬窗口全程跟進，避免多方溝通斷點",
];

export default function ServicesPage() {
  return (
    <PageShell path="/services">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra relative grid items-end gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <AmbientBackground />
          <Reveal>
            <LuxuryHeading
              kicker="服務矩陣"
              title="為策略價值而生的製作服務"
              copy="每項服務皆涵蓋企劃、執行、後期製作與部署級交付，讓成果不只好看，也能直接推進你的商業目標。"
            />
          </Reveal>

          <Reveal delay={0.08}>
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/30 p-3">
              <div className="relative overflow-hidden rounded-xl">
                <SafeImage
                  src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1800&q=80"
                  alt="Studio Pro 服務總覽"
                  width={1800}
                  height={1200}
                  className="h-[320px] w-full object-cover md:h-[380px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" />
                <div className="absolute right-5 bottom-5 left-5">
                  <p className="text-xs tracking-[0.24em] text-primary uppercase">Service Architecture</p>
                  <p className="mt-2 text-sm text-foreground/90 md:text-base">
                    以策略、製作與交付整合為核心，建立可持續複製的影像生產系統。
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
          <StaggerReveal className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {serviceCards.map((card) => (
              <PremiumCard key={card.title} className="h-full">
                <p className="text-xs tracking-[0.22em] text-primary uppercase">{card.tag}</p>
                <h3 className="mt-3 text-2xl">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {card.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </PremiumCard>
            ))}
          </StaggerReveal>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <PremiumCard className="h-full">
              <p className="text-xs tracking-[0.22em] text-primary uppercase">加值模組</p>
              <h3 className="mt-3 text-2xl">依需求擴展製作規模</h3>
              <div className="mt-5 grid gap-3">
                {addOns.map((item) => (
                  <div key={item.title} className="rounded-xl border border-border/70 bg-secondary/20 p-4">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>
            </PremiumCard>
          </Reveal>

          <Reveal delay={0.08}>
            <PremiumCard className="h-full">
              <p className="text-xs tracking-[0.22em] text-primary uppercase">服務承諾</p>
              <h3 className="mt-3 text-2xl">我們堅守的營運標準</h3>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {qualityAssurances.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <MagneticButton href="/pricing">查看方案價格</MagneticButton>
              </div>
            </PremiumCard>
          </Reveal>
        </div>
      </SectionShell>
    </PageShell>
  );
}
