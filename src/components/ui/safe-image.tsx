"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";

type SafeImageProps = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc?: string;
};

export function SafeImage({
  src,
  fallbackSrc = "/images/photo-fallback.svg",
  alt,
  ...props
}: SafeImageProps) {
  const [activeSrc, setActiveSrc] = useState(src);

  useEffect(() => {
    setActiveSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={activeSrc}
      alt={alt}
      onError={() => {
        if (activeSrc !== fallbackSrc) {
          setActiveSrc(fallbackSrc);
        }
      }}
    />
  );
}
