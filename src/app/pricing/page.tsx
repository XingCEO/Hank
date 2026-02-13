import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SafeImage } from "@/components/ui/safe-image";
import { MagneticButton } from "@/components/ultra/magnetic-button";
import { Reveal, StaggerReveal } from "@/components/ultra/reveal";
import { AmbientBackground, GoldDivider, LuxuryHeading, PremiumCard, SectionShell } from "@/components/ultra/section";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "方案價格",
  description: "透明的價格架構——為頂級攝影製作與長期合作而設計。",
};

const tiers = [
  {
    name: "經典啟程",
    price: "NT$ 38,000 起",
    points: ["半日製作", "30 張精修成品", "品牌授權使用", "7 日交付"],
  },
  {
    name: "旗艦企劃",
    price: "NT$ 68,000 起",
    points: ["全日製作", "80 張精修成品", "全通路輸出素材包", "優先檔期"],
    featured: true,
  },
  {
    name: "尊榮長約",
    price: "NT$ 128,000 起",
    points: ["季度內容配額", "優先排程權", "策略性視覺複審", "專屬客戶窗口"],
  },
];

const paymentPolicy = [
  "確認檔期支付 40% 訂金",
  "拍攝日前結清 60% 尾款",
  "急件專案加價幅度：20% 至 35%",
  "追加修圖與授權延伸依報價單執行",
];

const faqs = [
  {
    q: "可以客製化方案嗎？",
    a: "可以。企業或多部門專案可依實際時程、授權與交付格式建立專屬報價。",
  },
  {
    q: "報價是否含妝髮與場地？",
    a: "基礎方案不含，會以加值模組方式提供，內容與預算可在提案階段確認。",
  },
  {
    q: "多久可以拿到成品？",
    a: "一般案件為 7 至 14 日交付。若有急件時程，可在立案時安排優先流程。",
  },
];

export default function PricingPage() {
  return (
    <PageShell path="/pricing">
      <SectionShell className="pt-28">
        <div className="container-ultra relative grid items-end gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <AmbientBackground />
          <Reveal>
            <LuxuryHeading
              kicker="價格架構"
              title="頂級品質、明確範疇、可預期的交付"
              copy="以下為公開參考範圍，最終報價會依製作複雜度、時程與授權範圍做精準調整。"
            />
          </Reveal>

          <Reveal delay={0.08}>
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/30 p-3">
              <div className="relative overflow-hidden rounded-xl">
                <SafeImage
                  src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1800&q=80"
                  alt="Studio Pro 方案與報價"
                  width={1800}
                  height={1200}
                  className="h-[320px] w-full object-cover md:h-[380px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" />
                <div className="absolute right-5 bottom-5 left-5">
                  <p className="text-xs tracking-[0.24em] text-primary uppercase">Pricing Framework</p>
                  <p className="mt-2 text-sm text-foreground/90 md:text-base">
                    你會先看到透明基準，再拿到符合專案條件的正式報價。
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
          <StaggerReveal className="grid gap-5 md:grid-cols-3">
            {tiers.map((tier) => (
              <PremiumCard
                key={tier.name}
                className={tier.featured ? "border-primary/50 shadow-[var(--shadow-gold)]" : ""}
              >
                <p className="text-xs tracking-[0.22em] text-primary uppercase">{tier.featured ? "最多客戶選擇" : "方案"}</p>
                <h3 className="mt-3 text-2xl">{tier.name}</h3>
                <p className="mt-2 text-3xl gold-text">{tier.price}</p>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {tier.points.map((point) => (
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
              <p className="text-xs tracking-[0.22em] text-primary uppercase">付款條件</p>
              <h3 className="mt-3 text-2xl">商業等級帳務政策</h3>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {paymentPolicy.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </PremiumCard>
          </Reveal>

          <Reveal delay={0.08}>
            <PremiumCard className="h-full">
              <p className="text-xs tracking-[0.22em] text-primary uppercase">常見問題</p>
              <h3 className="mt-3 text-2xl">方案與採購說明</h3>
              <div className="mt-5 space-y-4">
                {faqs.map((item) => (
                  <div key={item.q} className="rounded-xl border border-border/70 bg-secondary/20 p-4">
                    <p className="text-sm font-medium">{item.q}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <MagneticButton href="/booking">索取正式報價</MagneticButton>
              </div>
            </PremiumCard>
          </Reveal>
        </div>
      </SectionShell>
    </PageShell>
  );
}
