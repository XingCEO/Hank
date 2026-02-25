import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionShell({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("section-space", className)}>{children}</section>;
}

export function SectionHeading({
  kicker,
  title,
  copy,
  className,
}: {
  kicker: string;
  title: string;
  copy?: string;
  className?: string;
}) {
  return (
    <header className={cn("max-w-2xl space-y-3", className)}>
      <p className="text-[0.7rem] font-medium tracking-[0.22em] text-foreground/50 uppercase">{kicker}</p>
      <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] leading-tight font-semibold tracking-tight">{title}</h2>
      {copy ? <p className="text-base leading-relaxed text-muted-foreground">{copy}</p> : null}
    </header>
  );
}

export function PremiumCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <article
      className={cn(
        "rounded-xl border border-border/40 bg-white p-5 md:p-6",
        "transition-all duration-300 ease-[var(--ease-smooth)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function AccentDivider() {
  return <div className="h-px w-16 bg-foreground/15" aria-hidden="true" />;
}
