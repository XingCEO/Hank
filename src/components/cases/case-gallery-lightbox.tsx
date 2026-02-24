"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";

type CaseGalleryLightboxProps = {
  images: string[];
  title: string;
};

export function CaseGalleryLightbox({ images, title }: CaseGalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isOpen = activeIndex !== null;

  const current = useMemo(() => {
    if (activeIndex === null) return "";
    return images[activeIndex] ?? "";
  }, [activeIndex, images]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((prev) => {
          if (prev === null) return prev;
          return (prev + 1) % images.length;
        });
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((prev) => {
          if (prev === null) return prev;
          return (prev - 1 + images.length) % images.length;
        });
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeydown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeydown);
    };
  }, [images.length, isOpen]);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group overflow-hidden rounded-2xl border border-border/70 bg-card/30 p-3 text-left"
          >
            <div className="relative overflow-hidden rounded-xl">
              <SafeImage
                src={image}
                alt={`${title} 圖庫 ${index + 1}`}
                width={1200}
                height={1500}
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          </button>
        ))}
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            className="focus-ring absolute top-4 right-4 rounded-full border border-border/80 bg-card/70 p-2 text-muted-foreground hover:text-foreground"
            aria-label="關閉燈箱"
            onClick={() => setActiveIndex(null)}
          >
            <X className="size-4" />
          </button>

          <button
            type="button"
            className="focus-ring absolute left-4 rounded-full border border-border/80 bg-card/70 p-2 text-muted-foreground hover:text-foreground"
            aria-label="上一張"
            onClick={(event) => {
              event.stopPropagation();
              setActiveIndex((prev) => {
                if (prev === null) return prev;
                return (prev - 1 + images.length) % images.length;
              });
            }}
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/30 p-3">
              <div className="relative overflow-hidden rounded-xl">
                <SafeImage
                  src={current}
                  alt={`${title} 放大檢視`}
                  width={1800}
                  height={1260}
                  className="max-h-[78vh] w-full object-contain"
                />
              </div>
            </div>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              {activeIndex !== null ? `${activeIndex + 1} / ${images.length}` : ""}
            </p>
          </div>

          <button
            type="button"
            className="focus-ring absolute right-4 rounded-full border border-border/80 bg-card/70 p-2 text-muted-foreground hover:text-foreground"
            aria-label="下一張"
            onClick={(event) => {
              event.stopPropagation();
              setActiveIndex((prev) => {
                if (prev === null) return prev;
                return (prev + 1) % images.length;
              });
            }}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      ) : null}
    </>
  );
}
