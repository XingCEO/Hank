import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SafeImage } from "@/components/ui/safe-image";
import { Reveal } from "@/components/ultra/reveal";
import { GoldDivider, LuxuryHeading, SectionShell } from "@/components/ultra/section";
import { caseStudies } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "作品集",
  description: "婚禮、品牌與肖像專案的高端影像作品精選。",
};

export default function PortfolioPage() {
  const categoryCount = new Set(caseStudies.map((item) => item.category)).size;
  const totalGalleryImages = caseStudies.reduce((acc, item) => acc + item.gallery.length, 0);

  const portfolioStats = [
    { label: "公開案例數", value: `${caseStudies.length}` },
    { label: "服務類別", value: `${categoryCount}` },
    { label: "展示影像數", value: `${totalGalleryImages}+` },
  ];

  return (
    <PageShell path="/portfolio">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra">
          <Reveal>
            <LuxuryHeading
              kicker="作品集"
              title="精選高端視覺敘事作品"
              copy="每一個畫面都由策略企劃、場景設計與嚴謹後期製作共同完成。"
            />
          </Reveal>
          <div className="mt-8">
            <GoldDivider />
          </div>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            {portfolioStats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/70 bg-card/30 p-4">
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{stat.label}</p>
                <p className="mt-2 text-3xl gold-text">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {caseStudies.map((item, index) => (
              <Reveal key={item.slug} delay={index * 0.05}>
                <Link href={`/cases/${item.slug}`} className="group block rounded-2xl border border-border/70 bg-card/30 p-3">
                  <div className="relative overflow-hidden rounded-xl">
                    <SafeImage
                      src={item.heroImage}
                      alt={item.name}
                      width={900}
                      height={1125}
                      className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/92 via-background/20 to-transparent" />
                    <div className="absolute right-4 bottom-4 left-4">
                      <p className="text-xs tracking-[0.2em] text-primary uppercase">{item.category}</p>
                      <h3 className="mt-2 text-xl">{item.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </SectionShell>
    </PageShell>
  );
}
