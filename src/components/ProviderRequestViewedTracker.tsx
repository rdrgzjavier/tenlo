"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { pushTrackingEvent } from "@/lib/analytics";

export default function ProviderRequestViewedTracker({ recordIds }: { recordIds: string[] }) {
  const router = useRouter();
  const sent = useRef(false);
  const recordIdsKey = recordIds.join(",");

  useEffect(() => {
    if (sent.current || !recordIdsKey) return;
    sent.current = true;
    void fetch("/api/provider/connection-viewed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordIds: recordIdsKey.split(",") })
    }).then(async (response) => {
      if (!response.ok) return;
      const result = await response.json() as { updated?: number };
      if ((result.updated ?? 0) > 0) {
        pushTrackingEvent("provider_request_viewed", { request_count: result.updated });
        router.refresh();
      }
    }).catch(() => undefined);
  }, [recordIdsKey, router]);

  return null;
}
