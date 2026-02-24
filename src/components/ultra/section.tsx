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
    <header className={cn("max-w-3xl space-y-[var(--space-phi-1)]", className)}>
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
        "clean-surface clean-border rounded-[1.45rem] p-[var(--space-phi-2)] md:p-[var(--space-phi-3)]",
        "transition-transform duration-500 ease-[var(--ease-smooth)] hover:-translate-y-1 hover:shadow-[var(--shadow-accent)]",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function AccentDivider() {
  return <div className="h-px w-28 bg-gradient-to-r from-transparent via-primary/80 to-transparent" aria-hidden="true" />;
}
