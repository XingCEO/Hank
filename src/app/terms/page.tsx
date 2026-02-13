import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { GoldDivider, LuxuryHeading, PremiumCard, SectionShell } from "@/components/ultra/section";

export const metadata: Metadata = {
  title: "服務條款",
  description: "Studio Pro 服務條款與合作約定。",
};

const terms = [
  {
    title: "服務範圍",
    body: "本網站提供攝影與影像製作服務資訊。實際合作範圍、交付內容與授權條件以雙方簽署之正式合約為準。",
  },
  {
    title: "預約與付款",
    body: "專案檔期以訂金到帳為保留條件。付款節點、退款規則與延期政策依合約條款執行。",
  },
  {
    title: "智慧財產與授權",
    body: "作品著作權與商業授權範圍依合約約定。未經授權不得轉售、再授權或作超出約定用途之使用。",
  },
  {
    title: "責任限制",
    body: "因不可抗力、公共事故或第三方平台限制導致之延誤，本工作室將協助調整交付時程，但不承擔超出合理範圍之間接損失。",
  },
];

export default function TermsPage() {
  return (
    <PageShell path="/terms">
      <SectionShell className="pt-28">
        <div className="container-ultra">
          <LuxuryHeading
            kicker="法律資訊"
            title="服務條款"
            copy="使用本網站與相關預約服務前，請先閱讀以下條款。"
          />
          <div className="mt-8">
            <GoldDivider />
          </div>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra grid gap-5 md:grid-cols-2">
          {terms.map((item) => (
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
