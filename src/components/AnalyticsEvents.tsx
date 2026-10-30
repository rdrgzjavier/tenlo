"use client";

import { useEffect } from "react";
import { flushPendingNavigationTrackingEvent, getActiveSearchContext, hasAnalyticsConsent, sendTrackingPayload, shouldAttachSearchContext, toDataLayerEvent } from "@/lib/analytics";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export default function AnalyticsEvents() {
  useEffect(() => {
    flushPendingNavigationTrackingEvent();
    window.addEventListener("tenlo:analytics-ready", flushPendingNavigationTrackingEvent);

    function pushTrackedEvent(event: Event) {
      if (!hasAnalyticsConsent()) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const tracked = target.closest<HTMLElement>("[data-track-action]");
      if (!tracked) return;
      const payload = toDataLayerEvent(tracked);
      if (!payload) return;
      const { searchContext: shouldAddSearchContext, ...eventPayload } = payload as Record<string, unknown>;
      const searchContext = shouldAddSearchContext === "true" || shouldAttachSearchContext(eventPayload.event) ? getActiveSearchContext() : null;
      sendTrackingPayload({ ...eventPayload, ...searchContext });
    }

    document.addEventListener("click", pushTrackedEvent);
    document.addEventListener("submit", pushTrackedEvent);
    return () => {
      window.removeEventListener("tenlo:analytics-ready", flushPendingNavigationTrackingEvent);
      document.removeEventListener("click", pushTrackedEvent);
      document.removeEventListener("submit", pushTrackedEvent);
    };
  }, []);

  return null;
}
