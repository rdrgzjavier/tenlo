"use client";

import { useEffect } from "react";
import { pushTrackingEvent, type TrackingAction } from "@/lib/analytics";

type AnalyticsValue = string | number | boolean | undefined;

export default function AnalyticsViewEvent({ event, params }: { event: TrackingAction; params: Record<string, AnalyticsValue> }) {
  const serializedParams = JSON.stringify(params);

  useEffect(() => {
    pushTrackingEvent(event, JSON.parse(serializedParams));
  }, [event, serializedParams]);

  return null;
}
