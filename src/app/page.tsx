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
    num: "01",
    title: "創意導演",
    body: "每個專案都由情緒板策略、造型語言與轉換導向鏡位規劃啟動。",
  },
  {
    num: "02",
    title: "製作精準",
    body: "從燈光、客戶溝通到後期交接，皆以高密度節奏與明確分工執行。",
  },
  {
    num: "03",
    title: "商業成果",
    body: "為品牌上市、整合行銷與個人識別打造可量化且可直接上線的視覺資產。",
  },
];

export default function HomePage() {
  return (
    <PageShell path="/">
      {/* ─── Hero ─── */}
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra">
          <div className="grid items-end gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <Reveal>
              <div className="space-y-5">
                <p className="text-[0.7rem] font-medium tracking-[0.22em] text-foreground/50 uppercase">專業攝影工作室</p>
                <h1 className="max-w-2xl text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[1.12] font-semibold tracking-tight">
                  為現代品牌與重要時刻
                  <br />
                  <span className="text-foreground/50">打造專業級影像</span>
                </h1>
                <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
                  結合高階藝術指導與製作系統，交付可直接推進商業時程的精緻視覺成果。
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <MagneticButton href="/booking">預約顧問諮詢</MagneticButton>
                  <Link
                    href="/portfolio"
                    className="focus-ring inline-flex items-center rounded-lg px-5 py-2.5 text-[0.82rem] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    瀏覽作品集 →
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {heroStats.map((metric) => (
                  <div key={metric.label} className="rounded-xl border border-border/40 bg-white/70 p-4">
                    <p className="text-2xl font-semibold text-foreground">{metric.value}</p>
                    <p className="mt-0.5 text-[0.8rem] text-muted-foreground">{metric.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </SectionShell>

      {/* ─── Case Studies ─── */}
      <SectionShell>
        <div className="container-ultra">
          <Reveal>
            <SectionHeading
              kicker="精選案例"
              title="光影敘事與場景編排的代表作品"
            />
          </Reveal>
          <div className="mt-8">
            <AccentDivider />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {caseStudies.slice(0, 6).map((item, index) => (
              <Reveal key={item.slug} delay={index * 0.06}>
                <Link
                  href={`/cases/${item.slug}`}
                  className="group block overflow-hidden rounded-xl border border-border/40 bg-white transition-shadow duration-300 hover:shadow-[var(--shadow-card)]"
                >
                  <div className="relative h-64 overflow-hidden">
                    <SafeImage
                      src={item.heroImage}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute right-4 bottom-4 left-4">
                      <p className="text-[0.65rem] tracking-[0.16em] text-white/70 uppercase">{item.category}</p>
                      <h3 className="mt-1 text-xl font-medium text-white">{item.name}</h3>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1} className="mt-8 flex justify-center">
            <MagneticButton href="/portfolio">查看完整作品集</MagneticButton>
          </Reveal>
        </div>
      </SectionShell>

      {/* ─── Promise Cards ─── */}
      <SectionShell>
        <div className="container-ultra">
          <StaggerReveal className="grid gap-4 md:grid-cols-3">
            {promiseCards.map((item) => (
              <PremiumCard key={item.title}>
                <span className="text-xs font-medium text-foreground/30">{item.num}</span>
                <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </PremiumCard>
            ))}
          </StaggerReveal>
        </div>
      </SectionShell>

      {/* ─── Testimonials ─── */}
      <SectionShell>
        <div className="container-ultra">
          <Reveal>
            <SectionHeading
              kicker="客戶評價"
              title="來自品牌客戶的真實回饋"
              copy="重視的不只畫面完成度，更是商業目標上的實際成效。"
            />
          </Reveal>
          <div className="mt-8">
            <AccentDivider />
          </div>
          <StaggerReveal className="mt-8 grid gap-4 md:grid-cols-2">
            {testimonials.map((item) => (
              <PremiumCard key={item.author}>
                <p className="text-sm leading-relaxed text-muted-foreground md:text-[0.92rem]">「{item.quote}」</p>
                <div className="mt-4 border-t border-border/30 pt-3">
                  <p className="text-sm font-medium">{item.author}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </PremiumCard>
            ))}
          </StaggerReveal>
        </div>
      </SectionShell>

      {/* ─── Brand Partners ─── */}
      <SectionShell>
        <div className="container-ultra">
          <Reveal>
            <SectionHeading
              kicker="合作品牌"
              title="長期合作與專案服務品牌"
              copy="以下為示範品牌牆版型，可直接替換為真實客戶標誌。"
            />
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {brandPartners.map((brand, index) => (
              <Reveal key={brand.name} delay={index * 0.03}>
                <div className="overflow-hidden rounded-lg border border-border/30 bg-white/60 p-3">
                  <SafeImage
                    src={brand.logo}
                    alt={brand.name}
                    width={420}
                    height={120}
                    className="h-12 w-full object-contain opacity-80"
                  />
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15} className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/40 bg-white/70 p-6">
              <div>
                <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">素材包</p>
                <h3 className="mt-1.5 text-xl font-semibold">需要社群模板與品牌素材？</h3>
                <p className="mt-1 text-sm text-muted-foreground">已準備可直接下載的 SVG 模板與備援素材。</p>
              </div>
              <MagneticButton href="/materials">前往素材包</MagneticButton>
            </div>
          </Reveal>
        </div>
      </SectionShell>

      <HomeAiConcierge />
    </PageShell>
  );
}
