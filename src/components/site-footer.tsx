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
      <p className="text-[0.7rem] font-medium tracking-[0.18em] text-foreground/60 uppercase">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer noopener" : undefined}
              className="focus-ring transition-colors hover:text-foreground"
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
    <footer className="border-t border-border/50 bg-white/60 pt-[var(--space-phi-4)] pb-8">
      <div className="container-ultra">
        <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div className="sm:col-span-2 xl:col-span-1">
            <p className="text-lg font-semibold tracking-[0.12em] text-foreground uppercase">{siteName}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              專注婚禮、品牌與人物影像製作，從企劃、拍攝到交付的完整商業流程。
            </p>
            <div className="mt-4 space-y-1.5 text-[0.82rem] text-muted-foreground">
              <p>週一至週六 10:00 - 19:00</p>
              <p>台北市信義區松仁路 100 號 11 樓</p>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              <Link className="focus-ring transition-colors hover:text-foreground" href="mailto:hello@studiopro.tw">
                hello@studiopro.tw
              </Link>
            </div>
          </div>

          <FooterLinkList title="導覽" links={[{ href: "/", label: "品牌旗艦" }, ...primaryNavLinks]} />
          <FooterLinkList title="服務" links={serviceLinks} />
          <FooterLinkList title="資源" links={supportLinks} />
          <FooterLinkList title="社群" links={socialLinks} />
        </div>

        {/* Info bar */}
        <div className="mt-10 grid gap-4 rounded-xl border border-border/40 bg-secondary/40 p-5 md:grid-cols-3">
          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">服務據點</p>
            <p className="mt-1.5 text-sm text-muted-foreground">台北 · 台中 · 高雄 · 線上</p>
          </div>
          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">回覆速度</p>
            <p className="mt-1.5 text-sm text-muted-foreground">4 小時內回覆</p>
          </div>
          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">交付格式</p>
            <p className="mt-1.5 text-sm text-muted-foreground">商業授權、發票、多格式雲端交付</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col gap-3 border-t border-border/40 pt-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {year} {siteName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="focus-ring transition-colors hover:text-foreground">
              服務條款
            </Link>
            <Link href="/privacy" className="focus-ring transition-colors hover:text-foreground">
              隱私權政策
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
