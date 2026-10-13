export type TrackingAction =
  | "page_view"
  | "result_opened"
  | "provider_profile_viewed"
  | "center_profile_viewed"
  | "contact_email_clicked"
  | "contact_phone_clicked"
  | "contact_web_clicked"
  | "contact_started"
  | "contact_form_completed"
  | "request_created"
  | "request_failed"
  | "share"
  | "provider_saved"
  | "provider_unsaved"
  | "provider_shared"
  | "search_started"
  | "filter_applied"
  | "search_submitted"
  | "search_results_viewed"
  | "search_zero_results"
  | "provider_impression"
  | "publish"
  | "claim_started"
  | "claim_submitted"
  | "provider_suggestion_started"
  | "provider_suggestion_submitted"
  | "provider_landing_viewed"
  | "newsletter_subscribed"
  | "newsletter_failed"
  | "map_directions_clicked";

export const analyticsSchemaVersion = "1.0";

type TrackingValue = string | number | boolean | undefined;

const activeSearchContextKey = "tenlo_active_search_context_v1";

type ActiveSearchContext = {
  search_id: string;
  recorded_at: number;
};

const searchLinkedActions = new Set<TrackingAction>([
  "result_opened",
  "provider_profile_viewed",
  "center_profile_viewed",
  "provider_saved",
  "provider_unsaved",
  "provider_shared",
  "contact_started",
  "contact_email_clicked",
  "contact_phone_clicked",
  "contact_web_clicked",
  "contact_form_completed",
  "request_created"
]);

export function shouldAttachSearchContext(action: unknown): action is TrackingAction {
  return typeof action === "string" && searchLinkedActions.has(action as TrackingAction);
}

export function hasAnalyticsConsent() {
  if (typeof window === "undefined") return false;
  return window.__tenloAnalyticsConsent === true;
}

function eventEnvelope() {
  return {
    event_id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    event_timestamp: new Date().toISOString(),
    schema_version: analyticsSchemaVersion
  };
}

export function trackingAttrs(action: TrackingAction, params: Record<string, TrackingValue>) {
  return Object.fromEntries(
    Object.entries({
      "data-track-action": action,
      ...Object.fromEntries(Object.entries(params).map(([key, value]) => [`data-track-${key}`, value]))
    }).filter(([, value]) => value !== undefined)
  );
}

export function toDataLayerEvent(element: HTMLElement) {
  const event = element.dataset.trackAction;
  if (!event) return null;

  return {
    ...eventEnvelope(),
    ...Object.fromEntries(
    Object.entries(element.dataset)
      .filter(([key]) => key.startsWith("track"))
      .map(([key, value]) => {
        const name = key === "trackAction" ? "event" : key.replace(/^track/, "").replace(/^[A-Z]/, (letter) => letter.toLowerCase());
        return [name, value];
      })
    )
  };
}

export function sendTrackingPayload(payload: Record<string, unknown>) {
  if (!hasAnalyticsConsent() || !window.dataLayer) return;
  if (typeof payload.event !== "string") return;
  window.dataLayer.push(payload);
}

export function pushTrackingEvent(action: TrackingAction, params: Record<string, TrackingValue>) {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  const searchContext = shouldAttachSearchContext(action) ? getActiveSearchContext() : null;
  sendTrackingPayload({ event: action, ...eventEnvelope(), ...params, ...searchContext });
}

export function setActiveSearchContext(searchId: string) {
  try {
    window.sessionStorage.setItem(activeSearchContextKey, JSON.stringify({ search_id: searchId, recorded_at: Date.now() }));
  } catch {
    // La medición no debe bloquear la navegación si el almacenamiento está restringido.
  }
}

export function getActiveSearchContext(): Pick<ActiveSearchContext, "search_id"> | null {
  try {
    const raw = window.sessionStorage.getItem(activeSearchContextKey);
    if (!raw) return null;
    const context = JSON.parse(raw) as ActiveSearchContext;
    if (!context.search_id || Date.now() - context.recorded_at > 30 * 60 * 1000) {
      window.sessionStorage.removeItem(activeSearchContextKey);
      return null;
    }
    return { search_id: context.search_id };
  } catch {
    return null;
  }
}
