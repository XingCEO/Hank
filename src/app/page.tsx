import Link from "next/link";
import { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SafeImage } from "@/components/ui/safe-image";
import { MagneticButton } from "@/components/ultra/magnetic-button";
import { Reveal, StaggerReveal } from "@/components/ultra/reveal";
import { AccentDivider, SectionHeading, PremiumCard, SectionShell } from "@/components/ultra/section";
import { HomeAiConcierge } from "@/components/ai/home-ai-concierge";
import { brandPartners, caseStudies, heroStats, testimonials } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "品牌旗艦",
};

const promiseCards = [
  {
    title: "創意導演",
    body: "每個專案都由情緒板策略、造型語言與轉換導向鏡位規劃啟動。",
  },
  {
    title: "製作精準",
    body: "從燈光、客戶溝通到後期交接，皆以高密度節奏與明確分工執行。",
  },
  {
    title: "商業成果",
    body: "為品牌上市、整合行銷與個人識別打造可量化且可直接上線的視覺資產。",
  },
];

export default function HomePage() {
  return (
    <PageShell path="/">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra relative grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div className="space-y-6">
              <p className="text-xs tracking-[0.3em] text-primary uppercase">旗艦版本</p>
              <h1 className="max-w-3xl text-5xl leading-tight md:text-7xl">
                為現代品牌與重要時刻打造
                <span className="accent-text">專業級影像</span>
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Studio Pro 結合高階藝術指導與製作系統，為你交付可直接推進商業時程的精緻視覺成果。
              </p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton href="/booking">預約顧問諮詢</MagneticButton>
                <Link
                  href="/portfolio"
                  className="focus-ring inline-flex items-center rounded-full border border-border bg-secondary/40 px-6 py-3 text-sm tracking-[0.14em] uppercase hover:border-primary/60"
                >
                  瀏覽作品集
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <PremiumCard>
              <p className="text-xs tracking-[0.26em] text-primary uppercase">工作室指標</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {heroStats.map((metric) => (
                  <div key={metric.label} className="rounded-xl border border-border/70 bg-background/30 p-4">
                    <p className="text-3xl accent-text">{metric.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{metric.label}</p>
                  </div>
                ))}
              </div>
            </PremiumCard>
          </Reveal>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra">
          <Reveal>
            <SectionHeading
              kicker="精選案例"
              title="以光影敘事、場景編排與商業質感打造的代表作品"
            />
          </Reveal>
          <div className="my-8">
            <AccentDivider />
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {caseStudies.slice(0, 6).map((item, index) => (
              <Reveal key={item.slug} delay={index * 0.08}>
                <Link
                  href={`/cases/${item.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-border/70 bg-card/40"
                >
                  <div className="relative h-72 overflow-hidden">
                    <SafeImage
                      src={item.heroImage}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute right-5 bottom-5 left-5">
                      <p className="text-xs tracking-[0.2em] text-white/80 uppercase">{item.category}</p>
                      <h3 className="mt-2 text-2xl text-white">{item.name}</h3>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.12} className="mt-8 flex justify-center">
            <MagneticButton href="/portfolio">查看更多完整作品集</MagneticButton>
          </Reveal>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra">
          <StaggerReveal className="grid gap-5 md:grid-cols-3">
            {promiseCards.map((item) => (
              <PremiumCard key={item.title}>
                <h3 className="text-2xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </PremiumCard>
            ))}
          </StaggerReveal>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra">
          <Reveal>
            <SectionHeading
              kicker="客戶評價"
              title="來自品牌客戶的真實回饋"
              copy="我們重視的不只畫面完成度，更是你在商業目標上的實際成效。"
            />
          </Reveal>
          <div className="my-8">
            <AccentDivider />
          </div>
          <StaggerReveal className="grid gap-5 md:grid-cols-2">
            {testimonials.map((item) => (
              <PremiumCard key={item.author}>
                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">「{item.quote}」</p>
                <p className="mt-5 text-sm font-medium">{item.author}</p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </PremiumCard>
            ))}
          </StaggerReveal>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra">
          <Reveal>
            <SectionHeading
              kicker="合作品牌"
              title="長期合作與專案服務品牌"
              copy="以下為示範品牌牆版型，可直接替換為你的真實客戶標誌。"
            />
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {brandPartners.map((brand, index) => (
              <Reveal key={brand.name} delay={index * 0.04}>
                <div className="overflow-hidden rounded-xl border border-border/70 bg-card/30 p-3">
                  <SafeImage
                    src={brand.logo}
                    alt={brand.name}
                    width={420}
                    height={120}
                    className="h-14 w-full object-contain opacity-90"
                  />
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2} className="mt-10">
            <PremiumCard>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs tracking-[0.24em] text-primary uppercase">素材包</p>
                  <h3 className="mt-2 text-2xl">需要社群模板與品牌素材？</h3>
                  <p className="mt-2 text-sm text-muted-foreground">已為你準備可直接下載的 SVG 模板與備援素材。</p>
                </div>
                <MagneticButton href="/materials">前往素材包</MagneticButton>
              </div>
            </PremiumCard>
          </Reveal>
        </div>
      </SectionShell>
      <HomeAiConcierge />
    </PageShell>
  );
}
