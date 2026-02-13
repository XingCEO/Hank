"use client";

import { useEffect, useRef, ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
};

export function ScrollReveal({ children, className = "", delay = 0, direction = "up" }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add("revealed");
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const dirClass =
    direction === "left" ? "scroll-reveal-left" :
    direction === "right" ? "scroll-reveal-right" :
    direction === "scale" ? "scroll-reveal-scale" :
    "scroll-reveal-up";

  return (
    <div ref={ref} className={`scroll-reveal ${dirClass} ${className}`}>
      {children}
    </div>
  );
}
