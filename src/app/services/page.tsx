import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { ScrollReveal } from "@/components/scroll-reveal";
import { serviceCards } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "尊榮服務",
  description: "頂級攝影服務——從企劃到交付，一站式完成的專業製作系統。",
};

const addOns = [
  "短影音素材剪輯",
  "造型與服裝指導",
  "場景設計與道具規劃",
  "媒體公關素材包裝",
  "跨城市製作支援",
];

export default function ServicesPage() {
  return (
    <PageShell path="/services">
      <section className="page-hero">
        <div className="shell">
          <p className="kicker fade-in">服務矩陣</p>
          <h1 className="fade-in stagger-1">為策略價值而生的製作服務，不僅止於美麗的成品。</h1>
          <p className="lead fade-in stagger-2">
            每項服務皆涵蓋企劃、執行、後期製作與部署級交付。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell grid-3">
          {serviceCards.map((card, index) => (
            <ScrollReveal key={card.title} delay={index * 120}>
              <article className="panel">
                <p className="kicker" style={{ marginBottom: 8 }}>
                  {card.tag}
                </p>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <ul>
                  {card.points.map((point) => (
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
                加值模組
              </p>
              <h3>依需求擴展製作規模。</h3>
              <div className="pill-row" style={{ marginTop: 14 }}>
                {addOns.map((item) => (
                  <span className="pill" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <article className="panel">
              <p className="kicker" style={{ marginBottom: 8 }}>
                服務承諾
              </p>
              <h3>我們堅守的營運標準。</h3>
              <ul>
                <li>諮詢四小時內首次回覆</li>
                <li>二十四小時內提供初步提案</li>
                <li>緊急專案最快四十八小時啟動</li>
              </ul>
              <div className="cta-row" style={{ marginTop: 18 }}>
                <Link className="btn btn-primary" href="/pricing">
                  查看方案價格
                </Link>
              </div>
            </article>
          </ScrollReveal>
        </div>
      </section>
    </PageShell>
  );
}
