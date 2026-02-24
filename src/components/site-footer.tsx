import Link from "next/link";
import { navItems, siteName } from "@/lib/site-content";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

const serviceLinks: FooterLink[] = [
  { href: "/services", label: "服務總覽" },
  { href: "/pricing", label: "方案價格" },
  { href: "/process", label: "合作流程" },
  { href: "/systems", label: "交付系統" },
];

const supportLinks: FooterLink[] = [
  { href: "/portfolio", label: "完整作品集" },
  { href: "/materials", label: "素材包下載" },
  { href: "/team", label: "團隊介紹" },
  { href: "/booking", label: "預約諮詢" },
];

const socialLinks: FooterLink[] = [
  { href: "https://www.instagram.com", label: "Instagram", external: true },
  { href: "https://www.youtube.com", label: "YouTube", external: true },
  { href: "https://www.facebook.com", label: "Facebook", external: true },
  { href: "https://line.me", label: "LINE Official", external: true },
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
              className="focus-ring hover:text-foreground"
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
  const primaryNavLinks = navItems.filter((item) => item.href !== "/");

  return (
    <footer className="border-t border-border/70 bg-card/20 py-[var(--space-phi-4)]">
      <div className="container-ultra">
        <div className="grid gap-[var(--space-phi-3)] sm:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          <div className="sm:col-span-2 xl:col-span-1">
            <p className="accent-text text-2xl tracking-[0.18em] uppercase">{siteName}</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              專注婚禮、品牌與人物影像製作，提供從企劃、拍攝到交付的完整商業流程。若你需要高品質且可直接落地使用的視覺成果，我們可提供完整顧問式合作。
            </p>
            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              <p>服務時間：週一至週六 10:00 - 19:00</p>
              <p>公司地址：台北市信義區松仁路 100 號 11 樓</p>
              <p>公司名稱：超星集團</p>
              <p>統一編號：90476123</p>
            </div>
            <div className="mt-5 text-sm text-muted-foreground">
              <Link className="focus-ring hover:text-foreground" href="mailto:hello@studiopro.tw">
                hello@studiopro.tw
              </Link>
              <span className="mx-2">·</span>
              <Link className="focus-ring hover:text-foreground" href="tel:+886912345678">
                +886 912 345 678
              </Link>
            </div>
          </div>

          <FooterLinkList title="快速導覽" links={[{ href: "/", label: "首頁" }, ...primaryNavLinks]} />
          <FooterLinkList title="服務與方案" links={serviceLinks} />
          <FooterLinkList title="支援資源" links={supportLinks} />
          <FooterLinkList title="社群媒體" links={socialLinks} />
        </div>

        <div className="mt-[var(--space-phi-3)] grid gap-4 rounded-2xl border border-border/70 bg-background/25 p-5 md:grid-cols-3">
          <div>
            <p className="text-xs tracking-[0.2em] text-primary uppercase">主要服務據點</p>
            <p className="mt-2 text-sm text-muted-foreground">台北 · 台中 · 高雄 · 線上跨區支援</p>
          </div>
          <div>
            <p className="text-xs tracking-[0.2em] text-primary uppercase">平均回覆</p>
            <p className="mt-2 text-sm text-muted-foreground">4 小時內回覆，急件可加速處理</p>
          </div>
          <div>
            <p className="text-xs tracking-[0.2em] text-primary uppercase">授權與交付</p>
            <p className="mt-2 text-sm text-muted-foreground">提供商業授權範圍、發票與多格式雲端交付</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {year} {siteName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="focus-ring hover:text-foreground">
              服務條款
            </Link>
            <Link href="/privacy" className="focus-ring hover:text-foreground">
              隱私權政策
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
