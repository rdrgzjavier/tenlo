"use client";

import { useEffect } from "react";

type AnalyticsValue = string | number | boolean | undefined;

export default function AnalyticsViewEvent({ event, params }: { event: string; params: Record<string, AnalyticsValue> }) {
  const serializedParams = JSON.stringify(params);

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...JSON.parse(serializedParams) });
  }, [event, serializedParams]);

  return null;
}
