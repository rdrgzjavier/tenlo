"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { pushTrackingEvent } from "@/lib/analytics";

type ShareButtonProps = {
  className?: string;
  itemId: string;
  itemType: "center" | "listing" | "provider";
  title: string;
};

export default function ShareButton({ className = "btn-secondary", itemId, itemType, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Mira esta ficha en Tenlo: ${title}`, url });
        pushTrackingEvent("provider_shared", { item: itemId, type: itemType, method: "native_share" });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      pushTrackingEvent("provider_shared", { item: itemId, type: itemType, method: "copy_link" });
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
