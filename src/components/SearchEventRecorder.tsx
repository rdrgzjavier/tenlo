"use client";

import { useEffect, useRef } from "react";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";

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
  const existing = window.localStorage.getItem(sessionStorageKey);
  if (existing) return existing;
  const created = window.crypto.randomUUID();
  window.localStorage.setItem(sessionStorageKey, created);
  return created;
}

export default function SearchEventRecorder({ query, category, municipality, filters, resultsCount }: SearchEventRecorderProps) {
  const recorded = useRef(false);
  const serializedFilters = JSON.stringify(filters);

  useEffect(() => {
    if (recorded.current || !hasSupabaseBrowserConfig()) return;
    recorded.current = true;

    const record = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("search_events").insert({
        anonymous_session_id: anonymousSessionId(),
        user_id: authData.user?.id ?? null,
        normalized_query: privacySafeQuery(query),
        category_id: category || null,
        municipality: municipality || null,
        filters: JSON.parse(serializedFilters),
        results_count: resultsCount
      });
    };

    void record();
  }, [category, municipality, query, resultsCount, serializedFilters]);

  return null;
}
