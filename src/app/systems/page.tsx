import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { ScrollReveal } from "@/components/scroll-reveal";
import { systemRows } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "營運系統",
  description: "驅動銷售管線、排程與交付成果的營運架構。",
};

export default function SystemsPage() {
  return (
    <PageShell path="/systems">
      <section className="page-hero">
        <div className="shell">
          <p className="kicker fade-in">工作室營運堆疊</p>
          <h1 className="fade-in stagger-1">從諮詢到交付，每個階段皆精準量化。</h1>
          <p className="lead fade-in stagger-2">
            這不是一個作品集外殼，而是具備可量測產出、轉換率與交付品質的完整生產系統。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <ScrollReveal>
            <div className="system-table">
              <div className="system-row">
                <div>模組</div>
                <div>技術堆疊</div>
                <div>負責人</div>
                <div>關鍵指標</div>
              </div>
              {systemRows.map((row) => (
                <div className="system-row" key={row.module}>
                  <div>{row.module}</div>
                  <div>{row.stack}</div>
                  <div>{row.owner}</div>
                  <div>{row.kpi}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
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
                自動化規則
              </p>
              <h3>在幕後自動運行的工作流程。</h3>
              <ul>
                <li>表單送出即建立 CRM 潛在客戶並通知製片人</li>
                <li>合格潛客自動觸發排程序列</li>
                <li>合約簽署後觸發訂金收款與準備清單</li>
                <li>交付完成後觸發好評蒐集流程</li>
              </ul>
            </article>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <article className="panel">
              <p className="kicker" style={{ marginBottom: 8 }}>
                每週複審節奏
              </p>
              <h3>我們每週追蹤的關鍵數字。</h3>
              <ul>
                <li>各渠道合格諮詢數量</li>
                <li>諮詢至通話轉換率</li>
                <li>提案至簽約成交率</li>
                <li>平均專案金額與利潤率穩定性</li>
              </ul>
            </article>
          </ScrollReveal>
        </div>
      </section>
    </PageShell>
  );
}
