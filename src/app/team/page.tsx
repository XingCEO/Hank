import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SafeImage } from "@/components/ui/safe-image";
import { Reveal, StaggerReveal } from "@/components/ultra/reveal";
import { GoldDivider, LuxuryHeading, PremiumCard, SectionShell } from "@/components/ultra/section";

export const metadata: Metadata = {
  title: "團隊",
  description: "由創意導演、製片、後製與客戶成功組成的高端攝影團隊。",
};

const members = [
  {
    role: "創意總監",
    name: "周宇恆",
    description:
      "主導視覺語言、敘事框架與構圖標準，統籌所有製作的藝術方向。曾任職國際廣告集團，擁有十五年頂級品牌視覺經驗。",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    specialties: ["藝術指導", "構圖美學", "品牌視覺"],
  },
  {
    role: "製片 / 專案經理",
    name: "林欣怡",
    description:
      "負責專案流程、利害關係人同步、時程調度與現場執行控管，確保每個專案從企劃到交付都精準落地。",
    photo:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1200&q=80",
    specialties: ["專案管理", "流程優化", "現場執行"],
  },
  {
    role: "後製主管",
    name: "黃美佳",
    description:
      "維持色調一致性與修圖品質，並管控網站與社群各通路的輸出規範，確保每次交付皆可直接上線。",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1200&q=80",
    specialties: ["色彩校正", "精修調色", "輸出管理"],
  },
  {
    role: "客戶成功經理",
    name: "陳柏翰",
    description:
      "管理客戶導入流程、溝通 SLA 與交付銜接，協助品牌建立長期且穩定的影像合作節奏。",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=1200&q=80",
    specialties: ["客戶關係", "策略規劃", "品質管控"],
  },
];

const stats = [
  { value: "15+", label: "年平均資歷" },
  { value: "300+", label: "專案經驗" },
  { value: "100%", label: "準時交付率" },
];

const principles = [
  {
    title: "精準主義",
    body: "每一張照片皆經過多輪品質檢核，以工業級精準度對待每一個像素。",
  },
  {
    title: "協作文化",
    body: "創意、製作、後期與客戶服務緊密協作，確保每個環節無縫銜接。",
  },
  {
    title: "持續進化",
    body: "每季固定進行技術研修與作品回顧，持續精進影像標準與交付效率。",
  },
];

export default function TeamPage() {
  return (
    <PageShell path="/team">
      <SectionShell className="pt-28">
        <div className="container-ultra">
          <Reveal>
            <LuxuryHeading
              kicker="團隊"
              title="以創意公司規格運作的影像團隊"
              copy="我們以明確分工與系統化協作，提供企業級可靠度與一致品質。"
            />
          </Reveal>
          <div className="mt-8">
            <GoldDivider />
          </div>
          <StaggerReveal className="mt-8 grid gap-4 sm:grid-cols-3">
            {stats.map((item) => (
              <PremiumCard key={item.label}>
                <p className="text-3xl gold-text">{item.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
              </PremiumCard>
            ))}
          </StaggerReveal>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra grid gap-5 lg:grid-cols-2">
          {members.map((member, index) => (
            <Reveal key={member.name} delay={index * 0.06}>
              <article className="overflow-hidden rounded-2xl border border-border/70 bg-card/30">
                <div className="grid md:grid-cols-[0.9fr_1.1fr]">
                  <div className="relative h-72 md:h-full">
                    <SafeImage
                      src={member.photo}
                      alt={`${member.name}｜${member.role}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-4 p-6 md:p-7">
                    <p className="text-xs tracking-[0.2em] text-primary uppercase">{member.role}</p>
                    <h2 className="text-2xl">{member.name}</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{member.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-border/70 bg-secondary/30 px-3 py-1 text-xs text-muted-foreground"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra">
          <Reveal>
            <PremiumCard>
              <p className="text-xs tracking-[0.24em] text-primary uppercase">團隊信條</p>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
                我們把視覺作品視為策略資產。這代表可複製的系統、可量測的成果，
                以及在高壓時程下依然穩定的品質標準。
              </p>
            </PremiumCard>
          </Reveal>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra">
          <Reveal>
            <LuxuryHeading
              kicker="工作哲學"
              title="系統化思維，藝術家靈魂"
              copy="創意與流程並行，才能持續交付兼具美感與商業效益的作品。"
            />
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <StaggerReveal className="grid gap-5 md:col-span-3 md:grid-cols-3">
              {principles.map((item) => (
                <PremiumCard key={item.title}>
                  <h3 className="text-2xl">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{item.body}</p>
                </PremiumCard>
              ))}
            </StaggerReveal>
          </div>
        </div>
      </SectionShell>
    </PageShell>
  );
}
