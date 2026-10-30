"use client";

import { useState } from "react";

type ImageWithFallbackProps = {
  src?: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  illustrative?: boolean;
  wrapperClassName?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
};

export default function ImageWithFallback({ src, fallbackSrc, alt, className, illustrative = false, wrapperClassName = "", loading = "lazy", fetchPriority }: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src ?? fallbackSrc);
  const priorityProps = fetchPriority ? { fetchPriority } : {};
  const localFallbackSrc = "/images/cards/servicio-familiar.svg";

  const image = (
    <img
      {...priorityProps}
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
        else if (currentSrc !== localFallbackSrc) setCurrentSrc(localFallbackSrc);
      }}
    />
  );

  if (!illustrative) return image;

  return (
    <span className={`relative block ${wrapperClassName}`}>
      {image}
      <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slatecopy shadow-sm ring-1 ring-line">
        Imagen ilustrativa
      </span>
    </span>
  );
}
