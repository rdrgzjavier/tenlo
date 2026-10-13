"use client";

import { useEffect } from "react";
import { hasAnalyticsConsent, pushTrackingEvent, type TrackingAction } from "@/lib/analytics";

type AnalyticsValue = string | number | boolean | undefined;

export default function AnalyticsViewEvent({ event, params }: { event: TrackingAction; params: Record<string, AnalyticsValue> }) {
  const serializedParams = JSON.stringify(params);

  useEffect(() => {
    let tracked = false;
    const trackView = () => {
      if (tracked || !hasAnalyticsConsent()) return;
      const parsedParams = JSON.parse(serializedParams) as Record<string, AnalyticsValue>;
      const entityId = parsedParams.provider_id ?? parsedParams.center_id ?? parsedParams.item;
      const uniqueViewKey = entityId ? `tenlo_unique_view_v1:${event}:${entityId}` : null;

      if (uniqueViewKey) {
        try {
          if (window.sessionStorage.getItem(uniqueViewKey)) {
            tracked = true;
            return;
          }
          window.sessionStorage.setItem(uniqueViewKey, new Date().toISOString());
        } catch {
          // Si el almacenamiento está restringido, se mantiene la medición básica.
        }
      }

      tracked = true;
      pushTrackingEvent(event, { ...parsedParams, view_scope: uniqueViewKey ? "session_unique" : "page_load" });
    };

    const readyTimer = window.setInterval(trackView, 50);
    const stopTimer = window.setTimeout(() => window.clearInterval(readyTimer), 10_000);
    trackView();
    window.addEventListener("tenlo:analytics-ready", trackView);
    return () => {
      window.clearInterval(readyTimer);
      window.clearTimeout(stopTimer);
      window.removeEventListener("tenlo:analytics-ready", trackView);
    };
  }, [event, serializedParams]);

  return null;
}
