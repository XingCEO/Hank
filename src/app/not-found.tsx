import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SectionShell, PremiumCard } from "@/components/ultra/section";

export default function NotFound() {
  return (
    <PageShell path="/">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra">
          <PremiumCard className="mx-auto max-w-3xl text-center">
            <p className="text-[0.7rem] font-medium tracking-[0.18em] text-foreground/40 uppercase">404</p>
            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">找不到你要的頁面</h1>
            <p className="mt-3 text-base text-muted-foreground">
              此頁面可能已移動或不存在，你可以返回首頁繼續瀏覽。
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="focus-ring inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-[0.82rem] font-medium text-background transition-colors hover:bg-foreground/85"
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
