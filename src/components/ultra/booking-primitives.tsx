import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function OptionChip({
  active,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "focus-luxury rounded-full border px-4 py-2 text-sm transition-colors",
        active
          ? "border-primary/70 bg-primary text-primary-foreground shadow-[0_10px_24px_oklch(0.62_0.1_210/0.25)]"
          : "border-border bg-secondary/35 text-secondary-foreground hover:border-primary/60 hover:bg-secondary/55",
        className,
      )}
      {...props}
    />
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-xs text-destructive">{message}</p>;
}
