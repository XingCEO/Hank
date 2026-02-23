import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SafeImage } from "@/components/ui/safe-image";
import { Reveal } from "@/components/ultra/reveal";
import { GoldDivider, LuxuryHeading, SectionShell } from "@/components/ultra/section";
import { caseStudies } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "A curated index of wedding, editorial, portrait, and campaign productions.",
};

function formatSlugTitle(slug: string): string {
  return slug
    .split("-")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

const visualRhythm = ["aspect-[4/5]", "aspect-[5/6]", "aspect-[3/4]", "aspect-[4/5]"];

export default function PortfolioPage() {
  const totalGalleryImages = caseStudies.reduce((acc, item) => acc + item.gallery.length, 0);
  const categories = new Set(caseStudies.map((item) => item.category)).size;

  const portfolioStats = [
    { label: "Case Studies", value: `${caseStudies.length}` },
    { label: "Categories", value: `${categories}` },
    { label: "Gallery Frames", value: `${totalGalleryImages}+` },
  ];

  return (
    <PageShell path="/portfolio">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra">
          <Reveal>
            <LuxuryHeading
              kicker="Portfolio Index"
              title="Campaign, Event, And Editorial Productions"
              copy="Browse projects by visual narrative. Each case page includes scope, outcomes, and gallery details."
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
              <Reveal key={item.slug} delay={(index % 6) * 0.05}>
                <Link href={`/cases/${item.slug}`} className="group block rounded-2xl border border-border/70 bg-card/30 p-3">
                  <div className="relative overflow-hidden rounded-xl">
                    <SafeImage
                      src={item.heroImage}
                      alt={formatSlugTitle(item.slug)}
                      width={900}
                      height={1125}
                      className={`${visualRhythm[index % visualRhythm.length]} w-full object-cover transition-transform duration-700 group-hover:scale-105`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/92 via-background/20 to-transparent" />
                    <div className="absolute right-4 bottom-4 left-4">
                      <p className="text-xs tracking-[0.2em] text-primary uppercase">Case Study</p>
                      <h3 className="mt-2 text-xl">{formatSlugTitle(item.slug)}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{`Project #${String(index + 1).padStart(2, "0")}`}</p>
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
