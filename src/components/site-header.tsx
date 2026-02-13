"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { MagneticButton } from "@/components/ultra/magnetic-button";
import { navItems, siteName } from "@/lib/site-content";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  currentPath: string;
};

export function SiteHeader({ currentPath }: SiteHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="container-ultra flex h-20 items-center justify-between gap-6">
        <Link href="/" className="focus-luxury flex flex-col">
          <span className="gold-text text-xl tracking-[0.2em] uppercase">{siteName}</span>
          <span className="text-[0.63rem] tracking-[0.28em] text-muted-foreground uppercase">暗黑奢華攝影工作室</span>
        </Link>

        <button
          type="button"
          aria-label="切換選單"
          onClick={() => setIsOpen((value) => !value)}
          className="focus-luxury inline-flex items-center rounded-full border border-border/80 p-2 text-muted-foreground md:hidden"
        >
          {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>

        <nav
          className={cn(
            "absolute top-20 right-4 left-4 rounded-2xl border border-border bg-card/95 p-4 shadow-[var(--shadow-luxury)] md:static md:flex md:items-center md:gap-2 md:border-0 md:bg-transparent md:p-0 md:shadow-none",
            isOpen ? "block" : "hidden md:flex",
          )}
        >
          {navItems.map((item) => {
            const active = item.href === "/" ? currentPath === "/" : currentPath.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "focus-luxury inline-flex rounded-full px-4 py-2 text-sm tracking-[0.08em] uppercase transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
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
