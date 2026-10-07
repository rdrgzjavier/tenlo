"use client";

import { useEffect } from "react";
import { hasAnalyticsConsent, sendTrackingPayload, toDataLayerEvent } from "@/lib/analytics";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export default function AnalyticsEvents() {
  useEffect(() => {
    function pushTrackedEvent(event: Event) {
      if (!hasAnalyticsConsent()) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const tracked = target.closest<HTMLElement>("[data-track-action]");
      if (!tracked) return;
      const payload = toDataLayerEvent(tracked);
      if (!payload) return;
      sendTrackingPayload(payload);
    }

    document.addEventListener("click", pushTrackedEvent);
    document.addEventListener("submit", pushTrackedEvent);
    return () => {
      document.removeEventListener("click", pushTrackedEvent);
      document.removeEventListener("submit", pushTrackedEvent);
    };
  }, []);

  return null;
}
