"use client";

import { useEffect, useRef } from "react";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";
import { hasAnalyticsConsent, persistDirectoryEvents, pushTrackingEvent, setActiveSearchContext } from "@/lib/analytics";
import { verticalIdForCategory } from "@/lib/verticals";

type SearchEventRecorderProps = {
  query?: string;
  category?: string;
  municipality?: string;
  filters: Record<string, string | undefined>;
  searchId?: string;
  resultsCount: number;
  results: Array<{ id: string; category: string; municipality: string; isProvider: boolean; acceptsRequests: boolean }>;
};

const sessionStorageKey = "tenlo_analytics_session_id_v1";
const recentSearchKey = "tenlo_recent_search_v1";
const reformulationWindowMs = 30 * 60 * 1000;

type RecentSearch = {
  signature?: string;
  recordedAt?: number;
  searchId?: string;
};

function privacySafeQuery(value?: string) {
  if (!value) return null;
  const normalized = value.trim().replace(/\s+/g, " ").toLowerCase().slice(0, 120);
  if (!normalized || normalized.includes("@") || /(?:\+?34)?[\s.-]*\d(?:[\s.-]*\d){7,}/.test(normalized)) return null;
  return normalized;
}

function anonymousSessionId() {
  try {
    const existing = window.sessionStorage.getItem(sessionStorageKey);
    if (existing) return existing;
    const created = window.crypto.randomUUID();
    window.sessionStorage.setItem(sessionStorageKey, created);
    return created;
  } catch {
    return window.crypto.randomUUID();
  }
}

function keywordSignature(value: string | null) {
  if (!value) return "none";
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function recentSearch() {
  try {
    const raw = window.sessionStorage.getItem(recentSearchKey);
    return raw ? JSON.parse(raw) as RecentSearch : null;
  } catch {
    return null;
  }
}

function wasRecentlyRecorded(signature: string) {
  const recent = recentSearch();
  return recent?.signature === signature && Boolean(recent.recordedAt && Date.now() - recent.recordedAt < 5_000);
}

function rememberRecording(signature: string, searchId: string) {
  try {
    window.sessionStorage.setItem(recentSearchKey, JSON.stringify({ signature, searchId, recordedAt: Date.now() }));
  } catch {
    // La medición no debe bloquear la experiencia si el almacenamiento está restringido.
  }
}

export default function SearchEventRecorder({ query, category, municipality, filters, searchId, resultsCount, results }: SearchEventRecorderProps) {
  const lastRecordedSignature = useRef("");
  const serializedFilters = JSON.stringify(filters);
  const serializedResults = JSON.stringify(results);

  useEffect(() => {
    const parsedFilters = JSON.parse(serializedFilters) as Record<string, string | undefined>;
    const hasSearchIntent = Boolean(query || category || municipality || Object.entries(parsedFilters).some(([key, value]) => key !== "region" && Boolean(value)));
    if (!hasSearchIntent) return;

    const safeQuery = privacySafeQuery(query);
    const safeFilters = { ...parsedFilters };
    delete safeFilters.tag;
    const parsedResults = JSON.parse(serializedResults) as SearchEventRecorderProps["results"];
    const providerResultCount = parsedResults.filter((result) => result.isProvider).length;
    const availableProviderCount = parsedResults.filter((result) => result.isProvider && result.acceptsRequests).length;
    const noAvailableProviders = providerResultCount > 0 && availableProviderCount === 0;
    const signature = JSON.stringify({ keyword: keywordSignature(safeQuery), category, municipality, filters: safeFilters, resultsCount, availableProviderCount });
    const recordSearch = () => {
      if (lastRecordedSignature.current === signature || wasRecentlyRecorded(signature) || !hasAnalyticsConsent()) return;
      const previousSearch = recentSearch();
      lastRecordedSignature.current = signature;
      const resolvedSearchId = searchId || window.crypto.randomUUID();
      rememberRecording(signature, resolvedSearchId);
      setActiveSearchContext(resolvedSearchId);
      const verticalId = verticalIdForCategory(category);
      const eventParams = {
        search_id: resolvedSearchId,
        category: category,
        vertical_id: verticalId,
        municipality,
        has_keyword: Boolean(safeQuery),
        result_count: resultsCount,
        zero_results: resultsCount === 0,
        provider_result_count: providerResultCount,
        available_provider_count: availableProviderCount,
        no_available_providers: noAvailableProviders
      };
      pushTrackingEvent("search_results_viewed", eventParams);
      if (resultsCount === 0) pushTrackingEvent("search_zero_results", eventParams);
      if (noAvailableProviders) pushTrackingEvent("search_no_available_results", eventParams);
      if (
        previousSearch?.signature &&
        previousSearch.signature !== signature &&
        previousSearch.searchId &&
        previousSearch.recordedAt &&
        Date.now() - previousSearch.recordedAt < reformulationWindowMs
      ) {
        pushTrackingEvent("search_reformulated", {
          previous_search_id: previousSearch.searchId,
          search_id: resolvedSearchId,
          category,
          municipality,
          has_keyword: Boolean(safeQuery),
          result_count: resultsCount
        });
      }
      const impressionEvents: Record<string, unknown>[] = [];
      parsedResults.forEach((result, index) => {
        const impressionEvent = pushTrackingEvent("provider_impression", {
          search_id: resolvedSearchId,
          item: result.id,
          type: result.isProvider ? "listing" : "center",
          category: result.category,
          municipality: result.municipality,
          position: index + 1
        });
        if (impressionEvent) impressionEvents.push(impressionEvent);
      });
      persistDirectoryEvents(impressionEvents);

      if (!hasSupabaseBrowserConfig()) return;

      const record = async () => {
        const supabase = createSupabaseBrowserClient();
        const { data: authData } = await supabase.auth.getUser();
        await supabase.from("search_events").insert({
          search_id: resolvedSearchId,
          anonymous_session_id: anonymousSessionId(),
          user_id: authData.user?.id ?? null,
          normalized_query: safeQuery,
          category_id: category || null,
          vertical_id: verticalId,
          municipality: municipality || null,
          filters: { ...safeFilters, has_keyword: Boolean(safeQuery), provider_result_count: providerResultCount, available_provider_count: availableProviderCount, no_available_providers: noAvailableProviders },
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
  }, [category, municipality, query, resultsCount, searchId, serializedFilters, serializedResults]);

  return null;
}
