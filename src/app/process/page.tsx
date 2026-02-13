import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { ScrollReveal } from "@/components/scroll-reveal";
import { processSteps } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "製作流程",
  description: "六階段品質管控流程——從需求探索到交付回顧的完整製作工作流程。",
};

export default function ProcessPage() {
  return (
    <PageShell path="/process">
      <section className="page-hero">
        <div className="shell">
          <p className="kicker fade-in">工作流程 SOP</p>
          <h1 className="fade-in stagger-1">為品質管控而工程化的六階段流程。</h1>
          <p className="lead fade-in stagger-2">
            一致性是系統化的成果。每個步驟皆有明確負責人、檢查點與交付物。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell timeline">
          {processSteps.map((item, index) => (
            <ScrollReveal key={item.step} delay={index * 100} direction="left">
              <article className="timeline-item">
                <div className="step-badge">{item.step}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p className="lead" style={{ marginTop: 8 }}>
                    {item.body}
                  </p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
