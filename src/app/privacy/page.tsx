import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { GoldDivider, LuxuryHeading, PremiumCard, SectionShell } from "@/components/ultra/section";

export const metadata: Metadata = {
  title: "隱私權政策",
  description: "Studio Pro 隱私權政策與資料使用說明。",
};

const policyRows = [
  {
    title: "蒐集資料類型",
    body: "我們可能蒐集姓名、電話、電子郵件、專案需求與網站使用行為資料，以提供預約回覆與服務優化。",
  },
  {
    title: "資料使用目的",
    body: "資料僅用於案件聯繫、報價、客服與服務流程管理，不會在未經同意下出售或提供給無關第三方。",
  },
  {
    title: "保存與保護",
    body: "我們採取合理的技術與管理措施保護資料，並於業務所需期間內保存資料，逾期則依規範刪除或匿名化。",
  },
  {
    title: "用戶權利",
    body: "你可提出資料查詢、更正、刪除或停止使用之請求，我們將在合理期間內完成處理。",
  },
];

export default function PrivacyPage() {
  return (
    <PageShell path="/privacy">
      <SectionShell className="pt-28">
        <div className="container-ultra">
          <LuxuryHeading
            kicker="法律資訊"
            title="隱私權政策"
            copy="我們重視你的個人資料安全，以下說明資料蒐集與使用方式。"
          />
          <div className="mt-8">
            <GoldDivider />
          </div>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra grid gap-5 md:grid-cols-2">
          {policyRows.map((item) => (
            <PremiumCard key={item.title}>
              <h3 className="text-2xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </PremiumCard>
          ))}
        </div>
      </SectionShell>
    </PageShell>
  );
}
