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
  | "search_submitted"
  | "search_results_viewed"
  | "search_zero_results"
  | "publish"
  | "claim_started"
  | "claim_submitted"
  | "provider_suggestion_started"
  | "provider_suggestion_submitted"
  | "map_directions_clicked";

export const analyticsSchemaVersion = "1.0";

type TrackingValue = string | number | boolean | undefined;

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

export function pushTrackingEvent(action: TrackingAction, params: Record<string, TrackingValue>) {
  if (typeof window === "undefined") return;
  const browserWindow = window as Window & { dataLayer?: Record<string, unknown>[] };
  browserWindow.dataLayer = browserWindow.dataLayer || [];
  browserWindow.dataLayer.push({ event: action, ...eventEnvelope(), ...params });
}
