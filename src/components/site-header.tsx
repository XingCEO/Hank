"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { MagneticButton } from "@/components/ultra/magnetic-button";
import { navItems, siteName } from "@/lib/site-content";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  currentPath: string;
};

export function SiteHeader({ currentPath }: SiteHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 12);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-b border-border/50 bg-white/80 shadow-[0_1px_8px_oklch(0.5_0.01_60/0.06)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-ultra flex h-16 items-center justify-between gap-6 md:h-[4.25rem]">
        <Link href="/" className="focus-ring group flex items-center gap-2.5">
          <span className="text-lg font-semibold tracking-[0.14em] text-foreground uppercase">{siteName}</span>
          <span className="hidden text-[0.6rem] tracking-[0.22em] text-muted-foreground/70 uppercase sm:inline">攝影工作室</span>
        </Link>

        <button
          type="button"
          aria-label="切換選單"
          onClick={() => setIsOpen((value) => !value)}
          className="focus-ring inline-flex items-center rounded-lg p-2 text-muted-foreground hover:bg-secondary md:hidden"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <nav
          className={cn(
            "absolute top-full right-4 left-4 rounded-xl border border-border/60 bg-white/95 p-3 shadow-[var(--shadow-card)] backdrop-blur-lg",
            "md:static md:flex md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none",
            "transition-[opacity,transform] duration-200",
            isOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0 md:pointer-events-auto md:translate-y-0 md:opacity-100",
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
                  "focus-ring block rounded-lg px-3.5 py-2 text-[0.82rem] tracking-[0.04em] transition-colors",
                  active
                    ? "bg-foreground/[0.06] font-medium text-foreground"
                    : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="mt-2 border-t border-border/40 pt-2 md:mt-0 md:ml-3 md:border-0 md:pt-0">
            <MagneticButton href="/booking" className="w-full md:w-auto">
              立即預約
            </MagneticButton>
          </div>
        </nav>
      </div>
    </header>
  );
}
