import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SectionShell, PremiumCard } from "@/components/ultra/section";

export default function NotFound() {
  return (
    <PageShell path="/">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra">
          <PremiumCard className="mx-auto max-w-3xl text-center">
            <p className="text-xs tracking-[0.24em] text-primary uppercase">404</p>
            <h1 className="mt-3 text-4xl md:text-5xl">找不到你要的頁面</h1>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              此頁面可能已移動或不存在，你可以返回首頁繼續瀏覽作品與預約資訊。
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="focus-luxury inline-flex items-center justify-center rounded-full border border-primary/40 bg-primary px-6 py-3 text-sm font-medium tracking-[0.16em] text-primary-foreground uppercase transition-colors hover:border-primary hover:bg-primary/90"
              >
                返回首頁
              </Link>
            </div>
          </PremiumCard>
        </div>
      </SectionShell>
    </PageShell>
  );
}
