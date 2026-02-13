import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SafeImage } from "@/components/ui/safe-image";
import { MagneticButton } from "@/components/ultra/magnetic-button";
import { Reveal, StaggerReveal } from "@/components/ultra/reveal";
import { AmbientBackground, GoldDivider, LuxuryHeading, PremiumCard, SectionShell } from "@/components/ultra/section";
import { processSteps } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "工作流程 SOP",
  description: "六階段品質管控流程——從需求探索到交付回顧的完整製作工作流程。",
};

const processDetails = [
  {
    owner: "客戶成功經理",
    checkpoint: "需求文件確認",
    output: "專案簡報 + 目標 KPI 定義",
    visual:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
    visualAlt: "需求探索會議情境",
  },
  {
    owner: "創意總監",
    checkpoint: "情緒板核准",
    output: "創意提案 + 鏡位腳本",
    visual:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80",
    visualAlt: "創意藍圖規劃",
  },
  {
    owner: "商務與製片",
    checkpoint: "條款雙方確認",
    output: "合約版本 + 排程鎖檔",
    visual:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80",
    visualAlt: "合約與預算確認",
  },
  {
    owner: "製片統籌",
    checkpoint: "現場 QC 巡檢",
    output: "當日拍攝記錄 + 備份清單",
    visual:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1400&q=80",
    visualAlt: "拍攝製作現場",
  },
  {
    owner: "後製總監",
    checkpoint: "色彩標準審核",
    output: "精修成品 + 多平台版本",
    visual:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1400&q=80",
    visualAlt: "後期製作工作站",
  },
  {
    owner: "專案經理",
    checkpoint: "交付驗收會議",
    output: "雲端交付入口 + 回顧報告",
    visual:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80",
    visualAlt: "交付與回顧會議",
  },
];

export default function ProcessPage() {
  return (
    <PageShell path="/process">
      <SectionShell className="pt-28">
        <div className="container-ultra relative grid items-end gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <AmbientBackground />
          <Reveal>
            <div>
              <LuxuryHeading
                kicker="工作流程 SOP"
                title="為品質管控而工程化的六階段流程"
                copy="一致性是系統化的成果。每個步驟皆有明確負責人、檢查點與交付物。"
              />
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-border/70 bg-secondary/20 px-4 py-2 text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  6 大階段
                </span>
                <span className="rounded-full border border-border/70 bg-secondary/20 px-4 py-2 text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  18 個品質檢查點
                </span>
                <span className="rounded-full border border-border/70 bg-secondary/20 px-4 py-2 text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  100% 可追溯交付
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/30 p-3">
              <div className="relative overflow-hidden rounded-xl">
                <SafeImage
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1800&q=80"
                  alt="Studio Pro 工作流程概覽"
                  width={1800}
                  height={1200}
                  className="h-[320px] w-full object-cover md:h-[380px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" />
                <div className="absolute right-5 bottom-5 left-5">
                  <p className="text-xs tracking-[0.22em] text-primary uppercase">Process Blueprint</p>
                  <p className="mt-2 text-sm text-foreground/90 md:text-base">
                    從需求到交付全流程可視化管理，確保每次專案都維持同等品質。
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

          <StaggerReveal className="grid gap-5 lg:grid-cols-2">
            {processSteps.map((item, index) => {
              const detail = processDetails[index] ?? processDetails[processDetails.length - 1];

              return (
                <PremiumCard key={item.step} className="h-full">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs tracking-[0.24em] text-primary uppercase">階段 {item.step}</p>
                      <h3 className="mt-2 text-2xl">{item.title}</h3>
                    </div>
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs tracking-[0.18em] text-primary uppercase">
                      SOP {item.step}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{item.body}</p>

                  <div className="mt-5 overflow-hidden rounded-xl border border-border/70 bg-background/35 p-2">
                    <SafeImage
                      src={detail.visual}
                      alt={detail.visualAlt}
                      width={1400}
                      height={900}
                      className="aspect-[16/10] w-full rounded-lg object-cover"
                    />
                  </div>

                  <div className="mt-5 grid gap-3 rounded-xl border border-border/70 bg-secondary/20 p-4 md:grid-cols-3">
                    <div>
                      <p className="text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase">負責人</p>
                      <p className="mt-1 text-sm">{detail.owner}</p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase">檢查點</p>
                      <p className="mt-1 text-sm">{detail.checkpoint}</p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase">交付物</p>
                      <p className="mt-1 text-sm">{detail.output}</p>
                    </div>
                  </div>
                </PremiumCard>
              );
            })}
          </StaggerReveal>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra">
          <Reveal>
            <PremiumCard>
              <div className="flex flex-wrap items-center justify-between gap-5">
                <div>
                  <p className="text-xs tracking-[0.24em] text-primary uppercase">下一步</p>
                  <h3 className="mt-2 text-2xl">想看你的專案如何套用這套 SOP？</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    我們可在諮詢中直接帶你走一次需求拆解與時程規劃，24 小時內提供初版提案。
                  </p>
                </div>
                <MagneticButton href="/booking">預約流程諮詢</MagneticButton>
              </div>
            </PremiumCard>
          </Reveal>
        </div>
      </SectionShell>
    </PageShell>
  );
}
