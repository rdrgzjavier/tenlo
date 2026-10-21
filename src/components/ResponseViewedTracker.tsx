"use client";

import { useEffect, useRef } from "react";
import { pushTrackingEvent } from "@/lib/analytics";

export default function ResponseViewedTracker({ requestId, status, hasResponse, hasAlternative }: { requestId: string; status: string; hasResponse: boolean; hasAlternative: boolean }) {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const storageKey = `tenlo_response_viewed_${requestId}`;
    if (window.sessionStorage.getItem(storageKey)) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      window.sessionStorage.setItem(storageKey, "1");
      pushTrackingEvent("family_viewed_response", { status, has_response: hasResponse, has_alternative: hasAlternative });
      observer.disconnect();
    }, { threshold: 0.5 });

    observer.observe(marker);
    return () => observer.disconnect();
  }, [requestId, status, hasResponse, hasAlternative]);

  return <span ref={markerRef} className="sr-only" aria-hidden="true" />;
}
