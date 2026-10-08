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
      tracked = true;
      pushTrackingEvent(event, JSON.parse(serializedParams));
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
