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
              <p className="text-[0.7rem] font-medium tracking-[0.18em] text-foreground/50 uppercase">案例研究 / {item.category}</p>
              <h1 className="text-[clamp(2rem,4.5vw,3.2rem)] leading-tight font-semibold tracking-tight">{item.name}</h1>
              <p className="text-base leading-relaxed text-muted-foreground">{item.subtitle}</p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="overflow-hidden rounded-xl border border-border/40 bg-white">
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
              <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">製作範疇</p>
              <h2 className="mt-2 text-xl font-semibold">製作範疇</h2>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                {item.scope.map((row) => (
                  <li key={row} className="flex gap-3">
                    <span className="mt-[0.55rem] block h-1 w-1 rounded-full bg-foreground/30" />
                    <span>{row}</span>
                  </li>
                ))}
              </ul>
            </PremiumCard>
          </Reveal>

          <Reveal delay={0.08}>
            <PremiumCard className="h-full">
              <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">專案成果</p>
              <h2 className="mt-2 text-xl font-semibold">可量化成果</h2>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                {item.outcomes.map((row) => (
                  <li key={row} className="flex gap-3">
                    <span className="mt-[0.55rem] block h-1 w-1 rounded-full bg-foreground/30" />
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
