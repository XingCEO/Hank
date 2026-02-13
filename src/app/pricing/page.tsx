import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { ScrollReveal } from "@/components/scroll-reveal";

export const metadata: Metadata = {
  title: "方案價格",
  description: "透明的價格架構——為頂級攝影製作與長期合作而設計。",
};

const tiers = [
  {
    name: "經典啟程",
    price: "NT$ 38,000 起",
    points: ["半日製作", "30 張精修成品", "品牌授權使用"],
  },
  {
    name: "旗艦企劃",
    price: "NT$ 68,000 起",
    points: ["全日製作", "80 張精修成品", "全通路輸出素材包"],
    featured: true,
  },
  {
    name: "尊榮長約",
    price: "NT$ 128,000 起",
    points: ["季度內容配額", "優先排程權", "策略性視覺複審"],
  },
];

export default function PricingPage() {
  return (
    <PageShell path="/pricing">
      <section className="page-hero">
        <div className="shell">
          <p className="kicker fade-in">價格架構</p>
          <h1 className="fade-in stagger-1">頂級品質、明確範疇、可預期的交付。</h1>
          <p className="lead fade-in stagger-2">
            以下為公開參考範圍，助您快速決策。最終報價依製作複雜度、時程與授權範圍調整。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell grid-3">
          {tiers.map((tier, index) => (
            <ScrollReveal key={tier.name} delay={index * 150} direction="up">
              <article
                className={`panel ${tier.featured ? "pricing-featured" : ""}`}
              >
                <p className="kicker" style={{ marginBottom: 8 }}>
                  {tier.featured ? "最多客戶選擇" : "方案"}
                </p>
                <h3>{tier.name}</h3>
                <p className="price-tag">{tier.price}</p>
                <ul>
                  {tier.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <div className="section-divider">
        <span>◆</span>
      </div>

      <section className="section">
        <div className="shell grid-2">
          <ScrollReveal direction="left">
            <article className="panel">
              <p className="kicker" style={{ marginBottom: 8 }}>
                付款條件
              </p>
              <h3>商業等級的帳務政策。</h3>
              <ul>
                <li>確認檔期支付 40% 訂金</li>
                <li>拍攝日前結清 60% 尾款</li>
                <li>急件加價幅度：20% 至 35%</li>
              </ul>
            </article>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <article className="panel">
              <p className="kicker" style={{ marginBottom: 8 }}>
                企業採購
              </p>
              <h3>為團隊與企業流程量身打造。</h3>
              <ul>
                <li>正式報價單與發票開立</li>
                <li>合約集中管理與版本控制</li>
                <li>授權範圍清楚界定</li>
              </ul>
              <div className="cta-row" style={{ marginTop: 18 }}>
                <Link className="btn btn-primary" href="/contact">
                  索取正式報價
                </Link>
              </div>
            </article>
          </ScrollReveal>
        </div>
      </section>
    </PageShell>
  );
}
