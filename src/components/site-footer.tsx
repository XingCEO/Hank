import Link from "next/link";
import { footerStudioLinks, footerWorkLinks, primaryNavigation, type NavigationLink } from "@/lib/navigation";
import { siteName } from "@/lib/site-content";

type FooterLink = NavigationLink & {
  external?: boolean;
};

const socialLinks: FooterLink[] = [
  { href: "https://www.instagram.com", label: "Instagram", external: true },
  { href: "https://www.youtube.com", label: "YouTube", external: true },
  { href: "https://www.facebook.com", label: "Facebook", external: true },
  { href: "https://line.me", label: "LINE 官方", external: true },
];

const trustSignals = [
  {
    label: "核心服務",
    value: "品牌企劃、肖像拍攝、活動紀實、婚禮影像",
  },
  {
    label: "初次回覆時效",
    value: "新諮詢 4 小時內回覆",
  },
  {
    label: "交付系統",
    value: "角色分層入口與完整稽核紀錄",
  },
];

function FooterLinkList({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <p className="text-xs tracking-[0.24em] text-primary uppercase">{title}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer noopener" : undefined}
              className="focus-luxury hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-card/30 py-[var(--space-phi-4)]">
      <div className="container-ultra">
        <div className="grid gap-[var(--space-phi-3)] xl:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <p className="gold-text text-2xl tracking-[0.18em] uppercase">{siteName}</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              以策略導向打造高端影像製作。從需求拆解到最終交付，
              每個階段皆有清楚節點與一致品質標準，讓品牌團隊能穩定複製成果。
            </p>
            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              <p>營業時間：Mon-Sun 10:00-19:00</p>
              <p>工作室：Taipei City, Taiwan</p>
              <p>電子郵件：hello@studiopro.tw</p>
              <p>聯絡電話：+886 912 345 678</p>
            </div>
            <div className="mt-5 text-sm text-muted-foreground">
              <Link className="focus-luxury hover:text-foreground" href="mailto:hello@studiopro.tw">
                hello@studiopro.tw
              </Link>
              <span className="mx-2">•</span>
              <Link className="focus-luxury hover:text-foreground" href="tel:+886912345678">
                +886 912 345 678
              </Link>
            </div>
          </div>

          <FooterLinkList title="網站導覽" links={primaryNavigation} />
          <FooterLinkList title="服務資訊" links={footerStudioLinks} />
          <FooterLinkList title="案例與社群" links={[...footerWorkLinks, ...socialLinks]} />
        </div>

        <div className="mt-[var(--space-phi-3)] grid gap-4 rounded-2xl border border-border/70 bg-background/30 p-5 md:grid-cols-3">
          {trustSignals.map((item) => (
            <div key={item.label}>
              <p className="text-xs tracking-[0.2em] text-primary uppercase">{item.label}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>{`© ${year} ${siteName}. All rights reserved.`}</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="focus-luxury hover:text-foreground">
              服務條款
            </Link>
            <Link href="/privacy" className="focus-luxury hover:text-foreground">
              隱私政策
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
