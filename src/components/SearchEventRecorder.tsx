"use client";

import { useEffect, useRef } from "react";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";
import { hasAnalyticsConsent, pushTrackingEvent } from "@/lib/analytics";

type SearchEventRecorderProps = {
  query?: string;
  category?: string;
  municipality?: string;
  filters: Record<string, string | undefined>;
  resultsCount: number;
};

const sessionStorageKey = "tenlo_analytics_session_id_v1";

function privacySafeQuery(value?: string) {
  if (!value) return null;
  const normalized = value.trim().replace(/\s+/g, " ").toLowerCase().slice(0, 120);
  if (!normalized || normalized.includes("@") || /(?:\+?34)?[\s.-]*\d(?:[\s.-]*\d){7,}/.test(normalized)) return null;
  return normalized;
}

function anonymousSessionId() {
  const existing = window.sessionStorage.getItem(sessionStorageKey);
  if (existing) return existing;
  const created = window.crypto.randomUUID();
  window.sessionStorage.setItem(sessionStorageKey, created);
  return created;
}

export default function SearchEventRecorder({ query, category, municipality, filters, resultsCount }: SearchEventRecorderProps) {
  const lastRecordedSignature = useRef("");
  const serializedFilters = JSON.stringify(filters);

  useEffect(() => {
    const signature = JSON.stringify({ query, category, municipality, serializedFilters, resultsCount });
    const recordSearch = () => {
      if (lastRecordedSignature.current === signature || !hasAnalyticsConsent()) return;
      lastRecordedSignature.current = signature;
      const searchId = window.crypto.randomUUID();
      const safeQuery = privacySafeQuery(query);
      const parsedFilters = JSON.parse(serializedFilters) as Record<string, string | undefined>;
      const safeFilters = { ...parsedFilters };
      delete safeFilters.tag;
      const eventParams = {
        search_id: searchId,
        category: category,
        municipality,
        has_keyword: Boolean(safeQuery),
        result_count: resultsCount,
        zero_results: resultsCount === 0
      };
      pushTrackingEvent("search_results_viewed", eventParams);
      if (resultsCount === 0) pushTrackingEvent("search_zero_results", eventParams);

      if (!hasSupabaseBrowserConfig()) return;

      const record = async () => {
        const supabase = createSupabaseBrowserClient();
        const { data: authData } = await supabase.auth.getUser();
        await supabase.from("search_events").insert({
          search_id: searchId,
          anonymous_session_id: anonymousSessionId(),
          user_id: authData.user?.id ?? null,
          normalized_query: safeQuery,
          category_id: category || null,
          municipality: municipality || null,
          filters: { ...safeFilters, has_keyword: Boolean(safeQuery) },
          results_count: resultsCount,
          zero_results: resultsCount === 0,
          schema_version: "1.0"
        });
      };

      void record();
    };

    const readyTimer = window.setInterval(recordSearch, 50);
    const stopTimer = window.setTimeout(() => window.clearInterval(readyTimer), 10_000);
    recordSearch();
    window.addEventListener("tenlo:analytics-ready", recordSearch);
    return () => {
      window.clearInterval(readyTimer);
      window.clearTimeout(stopTimer);
      window.removeEventListener("tenlo:analytics-ready", recordSearch);
    };
  }, [category, municipality, query, resultsCount, serializedFilters]);

  return null;
}
