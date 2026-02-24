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
    const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.18;
    setOffset({ x, y });
  };

  const handleReset = () => setOffset({ x: 0, y: 0 });

  return (
    <motion.div
      animate={reduceMotion ? { x: 0, y: 0 } : { x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 220, damping: 20, mass: 0.4 }}
    >
      <Link
        ref={ref}
        href={href}
        onMouseMove={handleMove}
        onMouseLeave={handleReset}
        onBlur={handleReset}
        className={cn(
          "focus-ring inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-medium tracking-[0.18em] uppercase transition-colors",
          "border-primary/40 bg-primary text-primary-foreground hover:border-primary hover:bg-primary/90",
          className,
        )}
      >
        {children}
      </Link>
    </motion.div>
  );
}
