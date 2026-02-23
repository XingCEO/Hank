import Link from "next/link";
import { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SafeImage } from "@/components/ui/safe-image";
import { MagneticButton } from "@/components/ultra/magnetic-button";
import { Reveal, StaggerReveal } from "@/components/ultra/reveal";
import { AmbientBackground, GoldDivider, LuxuryHeading, PremiumCard, SectionShell } from "@/components/ultra/section";
import { brandPartners, caseStudies } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Home",
};

const studioMetrics = [
  { label: "Projects Produced", value: "520+" },
  { label: "Average Rating", value: "4.9 / 5" },
  { label: "First Cut Delivery", value: "< 4h" },
];

const valuePillars = [
  {
    title: "Direction-led Production",
    body: "Every shoot has a creative map. Lighting, movement, and frame hierarchy are defined before camera roll.",
  },
  {
    title: "Commercial-grade Retouch",
    body: "Color science and skin work are handled with editorial standards, ready for both print and campaign use.",
  },
  {
    title: "Fast Team Workflow",
    body: "Your team receives timeline checkpoints, status visibility, and clear delivery windows from briefing to handoff.",
  },
];

const clientVoices = [
  {
    quote:
      "The team translated abstract ideas into a visual system we can re-use across campaigns. It felt like hiring both art direction and production in one unit.",
    author: "Brand Marketing Lead",
    role: "Skincare Launch Team",
  },
  {
    quote:
      "Execution was calm, structured, and fast. We had no ambiguity on timing, approvals, or output specs throughout the project.",
    author: "Operations Director",
    role: "Luxury Hospitality Group",
  },
];

function formatSlugTitle(slug: string): string {
  return slug
    .split("-")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

export default function HomePage() {
  const featuredCases = caseStudies.slice(0, 6);

  return (
    <PageShell path="/">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <AmbientBackground />
          <Reveal>
            <div className="space-y-6">
              <p className="text-xs tracking-[0.32em] text-primary uppercase">Creative Studio</p>
              <h1 className="max-w-3xl text-5xl leading-[1.02] md:text-7xl">
                Premium Visual Production
                <br />
                <span className="gold-text">Built For Brand Memory</span>
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                We combine art direction, photography, and post workflow into one unified production system for modern
                brands and milestones.
              </p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton href="/booking">Start a Booking</MagneticButton>
                <Link
                  href="/portfolio"
                  className="focus-luxury inline-flex items-center rounded-full border border-border bg-secondary/30 px-6 py-3 text-sm tracking-[0.14em] uppercase hover:border-primary/60"
                >
                  View Portfolio
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-4">
              <PremiumCard className="relative overflow-hidden">
                <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
                <p className="text-xs tracking-[0.2em] text-primary uppercase">Studio Snapshot</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-1">
                  {studioMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-xl border border-border/70 bg-background/25 p-4">
                      <p className="text-2xl gold-text">{metric.value}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </PremiumCard>

              {featuredCases[0] ? (
                <Link href={`/cases/${featuredCases[0].slug}`} className="group block overflow-hidden rounded-2xl border border-border/70">
                  <div className="relative h-72 overflow-hidden">
                    <SafeImage
                      src={featuredCases[0].heroImage}
                      alt={formatSlugTitle(featuredCases[0].slug)}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute right-5 bottom-5 left-5">
                      <p className="text-xs tracking-[0.18em] text-primary uppercase">Featured Case</p>
                      <h2 className="mt-2 text-2xl">{formatSlugTitle(featuredCases[0].slug)}</h2>
                    </div>
                  </div>
                </Link>
              ) : null}
            </div>
          </Reveal>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra">
          <Reveal>
            <LuxuryHeading
              kicker="Selected Work"
              title="Case Library With Real Campaign Outputs"
              copy="Explore recent productions across weddings, brand campaigns, executive portraits, and event documentation."
            />
          </Reveal>
          <div className="my-8">
            <GoldDivider />
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredCases.map((item, index) => {
              const featuredClass = index === 0 ? "md:col-span-2" : "";
              return (
                <Reveal key={item.slug} delay={index * 0.06} className={featuredClass}>
                  <Link href={`/cases/${item.slug}`} className="group block overflow-hidden rounded-2xl border border-border/70 bg-card/30">
                    <div className={`relative overflow-hidden ${index === 0 ? "h-[24rem]" : "h-[20rem]"}`}>
                      <SafeImage
                        src={item.heroImage}
                        alt={formatSlugTitle(item.slug)}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/92 via-background/18 to-transparent" />
                      <div className="absolute right-4 bottom-4 left-4">
                        <p className="text-xs tracking-[0.18em] text-primary uppercase">Case Study</p>
                        <h3 className="mt-2 text-2xl">{formatSlugTitle(item.slug)}</h3>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.12} className="mt-8 flex justify-center">
            <MagneticButton href="/portfolio">Browse Full Portfolio</MagneticButton>
          </Reveal>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra">
          <StaggerReveal className="grid gap-5 md:grid-cols-3">
            {valuePillars.map((item) => (
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
            <LuxuryHeading
              kicker="Client Notes"
              title="Feedback From Production Teams"
              copy="We focus on reliable process, not just visual style. Teams come back because delivery is clear and repeatable."
            />
          </Reveal>
          <div className="my-8">
            <GoldDivider />
          </div>
          <StaggerReveal className="grid gap-5 md:grid-cols-2">
            {clientVoices.map((item) => (
              <PremiumCard key={item.author}>
                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{`"${item.quote}"`}</p>
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
            <LuxuryHeading
              kicker="Trusted By"
              title="Cross-Industry Creative Partners"
              copy="A mix of consumer brands, hospitality groups, and technology teams collaborate with our production pipeline."
            />
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {brandPartners.map((brand, index) => (
              <Reveal key={brand.name} delay={index * 0.04}>
                <div className="overflow-hidden rounded-xl border border-border/70 bg-card/30 p-3">
                  <SafeImage src={brand.logo} alt={brand.name} width={420} height={120} className="h-14 w-full object-contain opacity-90" />
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2} className="mt-10">
            <PremiumCard>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs tracking-[0.24em] text-primary uppercase">Next Step</p>
                  <h3 className="mt-2 text-2xl">Ready To Lock Your Production Window?</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start from the booking flow and get a structured estimate in minutes.
                  </p>
                </div>
                <MagneticButton href="/booking">Book Now</MagneticButton>
              </div>
            </PremiumCard>
          </Reveal>
        </div>
      </SectionShell>
    </PageShell>
  );
}
