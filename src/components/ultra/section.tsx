import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionShell({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("section-space", className)}>{children}</section>;
}

export function LuxuryHeading({
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
    <header className={cn("max-w-3xl space-y-4", className)}>
      <p className="text-xs font-medium tracking-[0.3em] text-primary uppercase">{kicker}</p>
      <h2 className="text-4xl leading-tight md:text-5xl">{title}</h2>
      {copy ? <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{copy}</p> : null}
    </header>
  );
}

export function PremiumCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <article
      className={cn(
        "luxury-surface luxury-border rounded-2xl p-6 md:p-8",
        "transition-transform duration-500 ease-[var(--ease-luxury)] hover:-translate-y-1 hover:shadow-[var(--shadow-gold)]",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function GoldDivider() {
  return <div className="h-px w-28 bg-gradient-to-r from-transparent via-primary/80 to-transparent" aria-hidden="true" />;
}

export function AmbientBackground() {
  return (
    <>
      <span className="ambient-orb -top-16 left-[8%] h-44 w-44 bg-primary/20" />
      <span className="ambient-orb top-[40%] right-[10%] h-52 w-52 bg-accent/30 [animation-delay:3s]" />
      <span className="ambient-orb bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 bg-primary/15 [animation-delay:6s]" />
    </>
  );
}
