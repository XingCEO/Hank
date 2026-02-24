import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SafeImage } from "@/components/ui/safe-image";
import { Reveal } from "@/components/ultra/reveal";
import { AccentDivider, SectionHeading, PremiumCard, SectionShell } from "@/components/ultra/section";

export const metadata: Metadata = {
  title: "素材包",
  description: "提供社群版型、案例封面、Logo 安全區與備援素材下載。",
};

const materialItems = [
  {
    name: "方形貼文模板",
    size: "1080 x 1080",
    file: "/materials/social-post-template.svg",
  },
  {
    name: "限時動態模板",
    size: "1080 x 1920",
    file: "/materials/social-story-template.svg",
  },
  {
    name: "案例封面模板",
    size: "1600 x 900",
    file: "/materials/case-cover-template.svg",
  },
  {
    name: "Logo 安全區模板",
    size: "1200 x 800",
    file: "/materials/logo-safe-zone-template.svg",
  },
  {
    name: "照片備援圖",
    size: "1200 x 1500",
    file: "/images/photo-fallback.svg",
  },
];

export default function MaterialsPage() {
  return (
    <PageShell path="/materials">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra">
          <Reveal>
            <SectionHeading
              kicker="素材包"
              title="可直接使用的品牌與社群素材模板"
              copy="你可以下載這些模板快速做提案、貼文封面與案例視覺。所有檔案皆為可編輯 SVG。"
            />
          </Reveal>
          <div className="mt-8">
            <AccentDivider />
          </div>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {materialItems.map((item, index) => (
            <Reveal key={item.file} delay={index * 0.05}>
              <PremiumCard className="h-full">
                <div className="overflow-hidden rounded-xl border border-border/70 bg-background/40 p-2">
                  <SafeImage
                    src={item.file}
                    alt={item.name}
                    width={1000}
                    height={1000}
                    className="aspect-[4/3] w-full rounded-lg object-cover"
                  />
                </div>
                <h3 className="mt-5 text-2xl">{item.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">尺寸：{item.size}</p>
                <div className="mt-5">
                  <Link
                    href={item.file}
                    download
                    className="focus-ring inline-flex items-center justify-center rounded-full border border-primary/40 bg-primary px-5 py-2 text-xs font-medium tracking-[0.14em] text-primary-foreground uppercase transition-colors hover:border-primary hover:bg-primary/90"
                  >
                    下載素材
                  </Link>
                </div>
              </PremiumCard>
            </Reveal>
          ))}
        </div>
      </SectionShell>
    </PageShell>
  );
}
