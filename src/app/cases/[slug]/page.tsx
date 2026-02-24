import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { CaseGalleryLightbox } from "@/components/cases/case-gallery-lightbox";
import { SafeImage } from "@/components/ui/safe-image";
import { Reveal } from "@/components/ultra/reveal";
import { AccentDivider, SectionHeading, PremiumCard, SectionShell } from "@/components/ultra/section";
import { caseStudies } from "@/lib/site-content";

type CasePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return caseStudies.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = caseStudies.find((entry) => entry.slug === slug);

  if (!item) {
    return { title: "找不到案例" };
  }

  return {
    title: item.name,
    description: item.summary,
  };
}

export default async function CaseDetailPage({ params }: CasePageProps) {
  const { slug } = await params;
  const item = caseStudies.find((entry) => entry.slug === slug);

  if (!item) {
    notFound();
  }

  return (
    <PageShell path="/portfolio">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra space-y-8">
          <Reveal>
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-medium tracking-[0.28em] text-primary uppercase">案例研究 / {item.category}</p>
              <h1 className="text-4xl leading-tight md:text-6xl">{item.name}</h1>
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{item.subtitle}</p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/30">
              <div className="relative">
                <SafeImage
                  src={item.heroImage}
                  alt={item.name}
                  width={1800}
                  height={1125}
                  priority
                  className="h-[44vh] min-h-[320px] w-full object-cover md:h-[56vh]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute right-6 bottom-6 left-6 md:right-8 md:bottom-8 md:left-8">
                  <p className="text-xs tracking-[0.26em] text-white uppercase">{item.category}</p>
                  <p className="mt-2 max-w-2xl text-sm text-white/90 md:text-base">{item.summary}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra grid gap-5 lg:grid-cols-2">
          <Reveal>
            <PremiumCard className="h-full">
              <p className="text-xs tracking-[0.24em] text-primary uppercase">製作範疇</p>
              <h2 className="mt-3 text-2xl md:text-3xl">製作範疇</h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                {item.scope.map((row) => (
                  <li key={row} className="flex gap-3">
                    <span className="mt-[0.55rem] block h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{row}</span>
                  </li>
                ))}
              </ul>
            </PremiumCard>
          </Reveal>

          <Reveal delay={0.08}>
            <PremiumCard className="h-full">
              <p className="text-xs tracking-[0.24em] text-primary uppercase">專案成果</p>
              <h2 className="mt-3 text-2xl md:text-3xl">可量化成果</h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                {item.outcomes.map((row) => (
                  <li key={row} className="flex gap-3">
                    <span className="mt-[0.55rem] block h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{row}</span>
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
            <SectionHeading
              kicker="圖庫"
              title={`${item.name} 精選畫面`}
              copy="完整調色與跨平台裁切版本可於交付入口中查看。"
            />
          </Reveal>
          <div className="my-8">
            <AccentDivider />
          </div>
          <CaseGalleryLightbox images={item.gallery} title={item.name} />
        </div>
      </SectionShell>
    </PageShell>
  );
}
