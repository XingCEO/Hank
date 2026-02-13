import Link from "next/link";
import { siteName } from "@/lib/site-content";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 py-12">
      <div className="container-ultra grid gap-8 md:grid-cols-3">
        <div>
          <p className="gold-text text-xl tracking-[0.18em] uppercase">{siteName}</p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            為婚禮、品牌與肖像製作提供編輯級視覺統籌與交付規劃。
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.22em] text-primary uppercase">服務據點</p>
          <p className="mt-3 text-sm text-muted-foreground">台北 · 台中 · 高雄</p>
        </div>
        <div>
          <p className="text-xs tracking-[0.22em] text-primary uppercase">聯絡方式</p>
          <p className="mt-3 text-sm text-muted-foreground">
            <Link className="focus-luxury hover:text-foreground" href="mailto:hello@studiopro.tw">
              hello@studiopro.tw
            </Link>
            <br />
            <Link className="focus-luxury hover:text-foreground" href="tel:+886912345678">
              +886 912 345 678
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
