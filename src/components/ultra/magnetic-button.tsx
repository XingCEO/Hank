"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MouseEvent, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function MagneticButton({ href, children, className }: MagneticButtonProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMove = (event: MouseEvent<HTMLAnchorElement>) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
    setOffset({ x, y });
  };

  const handleReset = () => setOffset({ x: 0, y: 0 });

  return (
    <motion.div
      animate={reduceMotion ? { x: 0, y: 0 } : { x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 260, damping: 24, mass: 0.35 }}
    >
      <Link
        ref={ref}
        href={href}
        onMouseMove={handleMove}
        onMouseLeave={handleReset}
        onBlur={handleReset}
        className={cn(
          "focus-luxury inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold tracking-[0.16em] uppercase transition-colors",
          "border-primary/30 bg-primary/95 text-primary-foreground hover:border-primary hover:bg-primary",
          className,
        )}
      >
        {children}
      </Link>
    </motion.div>
  );
}
