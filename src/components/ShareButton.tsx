"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { pushTrackingEvent } from "@/lib/analytics";

type ShareButtonProps = {
  category?: string;
  className?: string;
  itemId: string;
  itemType: "center" | "listing" | "provider";
  municipality?: string;
  title: string;
};

export default function ShareButton({ category, className = "btn-secondary", itemId, itemType, municipality, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Mira esta ficha en Tenlo: ${title}`, url });
        pushTrackingEvent("provider_shared", { item: itemId, type: itemType, category, municipality, method: "native_share" });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      pushTrackingEvent("provider_shared", { item: itemId, type: itemType, category, municipality, method: "copy_link" });
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className={className} onClick={handleShare}>
      {copied ? <Check size={17} aria-hidden /> : <Share2 size={17} aria-hidden />}
      {copied ? "Enlace copiado" : "Compartir ficha"}
    </button>
  );
}
