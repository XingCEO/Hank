"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Sparkles, X } from "lucide-react";
import { MagneticButton } from "@/components/ultra/magnetic-button";
import { primaryNavigation } from "@/lib/navigation";
import { siteName } from "@/lib/site-content";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  currentPath: string;
};

function isActivePath(currentPath: string, href: string): boolean {
  if (href === "/") {
    return currentPath === "/";
  }
  return currentPath.startsWith(href);
}

export function SiteHeader({ currentPath }: SiteHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/65 bg-background/72 backdrop-blur-2xl">
      <div className="container-ultra flex h-[5.25rem] items-center justify-between gap-6">
        <Link href="/" className="focus-luxury flex flex-col">
          <span className="gold-text text-xl tracking-[0.2em] uppercase">{siteName}</span>
          <span className="inline-flex items-center gap-1 text-[0.63rem] tracking-[0.12em] text-muted-foreground">
            <Sparkles className="size-3" />
            品牌影像製作系統
          </span>
        </Link>

        <button
          type="button"
          aria-label={isOpen ? "關閉導覽選單" : "開啟導覽選單"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
          className="focus-luxury inline-flex items-center rounded-full border border-border/80 bg-card/65 p-2 text-muted-foreground md:hidden"
        >
          {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>

        <nav
          className={cn(
            "absolute top-20 right-4 left-4 rounded-2xl border border-border/80 bg-card/95 p-4 shadow-[var(--shadow-luxury)] md:static md:flex md:items-center md:gap-2 md:border-0 md:bg-transparent md:p-0 md:shadow-none",
            isOpen ? "block" : "hidden md:flex",
          )}
        >
          {primaryNavigation.map((item) => {
            const active = isActivePath(currentPath, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "focus-luxury inline-flex rounded-full px-4 py-2 text-sm tracking-[0.06em] transition-colors",
                  active
                    ? "bg-primary/95 text-primary-foreground shadow-[0_10px_30px_oklch(0.62_0.1_210/0.25)]"
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="mt-3 md:mt-0 md:ml-4">
            <MagneticButton href="/booking" className="w-full md:w-auto">
              立即預約
            </MagneticButton>
          </div>
        </nav>
      </div>
    </header>
  );
}
