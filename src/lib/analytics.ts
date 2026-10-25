import { verticalIdForCategory } from "@/lib/verticals";
import { municipalityIdForName } from "@/lib/municipalities";

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
  | "provider_compared"
  | "provider_shared"
  | "search_started"
  | "filter_applied"
  | "search_submitted"
  | "search_results_viewed"
  | "search_zero_results"
  | "search_no_available_results"
  | "search_reformulated"
  | "provider_impression"
  | "publish"
  | "claim_started"
  | "claim_submitted"
  | "provider_suggestion_started"
  | "provider_suggestion_submitted"
  | "provider_landing_viewed"
  | "newsletter_subscribed"
  | "newsletter_failed"
  | "registration_completed"
  | "registration_failed"
  | "map_directions_clicked"
  | "connection_marked_useful"
  | "outcome_reported"
  | "family_viewed_response"
  | "provider_request_viewed"
  | "provider_request_responded"
  | "provider_request_declined"
  | "provider_request_response_failed"
  | "profile_edit_started"
  | "profile_section_completed"
  | "profile_submitted";

export const analyticsSchemaVersion = "1.0";

type TrackingValue = string | number | boolean | undefined;

const protectedTrackingKeys = new Set([
  "address",
  "child_name",
  "contact_email",
  "contact_phone",
  "email",
  "first_name",
  "full_address",
  "full_name",
  "last_name",
  "message",
  "minor_name",
  "name",
  "normalized_query",
  "notes",
  "phone",
  "query",
  "request_id",
  "search_term",
  "text",
  "user_id",
  "family_id"
]);

const emailPattern = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/i;
const phonePattern = /(?:\+?34)?[\s.-]*\d(?:[\s.-]*\d){7,}/;

const activeSearchContextKey = "tenlo_active_search_context_v1";
const analyticsSessionKey = "tenlo_directory_session_id_v1";

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

const persistedDirectoryActions = new Set<TrackingAction>([
  "provider_impression",
  "result_opened",
  "provider_profile_viewed",
  "center_profile_viewed",
  "contact_started",
  "contact_form_completed",
  "request_created",
  "contact_email_clicked",
  "contact_phone_clicked",
  "contact_web_clicked",
  "map_directions_clicked",
  "provider_saved",
  "provider_unsaved",
  "provider_shared"
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

function sanitizeTrackingEntries(entries: Array<[string, unknown]>) {
  return entries.filter(([key, value]) => {
    if (protectedTrackingKeys.has(key.toLowerCase())) return false;
    if (typeof value !== "string") return typeof value === "number" || typeof value === "boolean";
    return value.length <= 120 && !emailPattern.test(value) && !phonePattern.test(value);
  });
}

function withStableDimensions(params: Record<string, TrackingValue>) {
  const dimensions = { ...params };

  if (typeof params.category === "string") {
    dimensions.category_id ??= params.category;
    dimensions.vertical_id ??= verticalIdForCategory(params.category);
  }
  if (typeof params.municipality === "string") {
    dimensions.municipality_id ??= municipalityIdForName(params.municipality);
  }
  if (!dimensions.profile_id) {
    if (typeof params.provider_id === "string") dimensions.profile_id = `provider:${params.provider_id}`;
    else if (typeof params.center_id === "string") dimensions.profile_id = `center:${params.center_id}`;
    else if (typeof params.item === "string" && typeof params.type === "string") dimensions.profile_id = `${params.type}:${params.item}`;
  }

  return dimensions;
}

export function trackingAttrs(action: TrackingAction, params: Record<string, TrackingValue>) {
  const safeParams = Object.fromEntries(sanitizeTrackingEntries(Object.entries(withStableDimensions(params))));
  return Object.fromEntries(
    Object.entries({
      "data-track-action": action,
      ...Object.fromEntries(Object.entries(safeParams).map(([key, value]) => [`data-track-${key}`, value]))
    }).filter(([, value]) => value !== undefined)
  );
}

export function toDataLayerEvent(element: HTMLElement) {
  const event = element.dataset.trackAction;
  if (!event) return null;

  const params = Object.entries(element.dataset)
    .filter(([key]) => key.startsWith("track") && key !== "trackAction")
    .map(([key, value]) => [key.replace(/^track/, "").replace(/^[A-Z]/, (letter) => letter.toLowerCase()), value] as [string, unknown]);

  return {
    ...eventEnvelope(),
    event,
    ...Object.fromEntries(sanitizeTrackingEntries(params))
  };
}

export function sendTrackingPayload(payload: Record<string, unknown>) {
  if (!hasAnalyticsConsent()) return;
  if (typeof payload.event !== "string") return;
  const { event, event_id, event_timestamp, schema_version, ...params } = payload;
  window.dataLayer?.push({
    event,
    event_id,
    event_timestamp,
    schema_version,
    ...Object.fromEntries(sanitizeTrackingEntries(Object.entries(params)))
  });

  if (event !== "provider_impression") persistDirectoryEvents([payload]);
}

export function pushTrackingEvent(action: TrackingAction, params: Record<string, TrackingValue>) {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return null;
  const searchContext = shouldAttachSearchContext(action) ? getActiveSearchContext() : null;
  const payload = { event: action, ...eventEnvelope(), ...withStableDimensions(params), ...searchContext };
  sendTrackingPayload(payload);
  return payload;
}

function directorySessionId() {
  try {
    const existing = window.sessionStorage.getItem(analyticsSessionKey);
    if (existing) return existing;
    const created = window.crypto.randomUUID();
    window.sessionStorage.setItem(analyticsSessionKey, created);
    return created;
  } catch {
    return window.crypto.randomUUID();
  }
}

function directoryEvent(payload: Record<string, unknown>) {
  const eventName = typeof payload.event === "string" ? payload.event as TrackingAction : null;
  const profileId = typeof payload.profile_id === "string" ? payload.profile_id : null;
  if (!eventName || !persistedDirectoryActions.has(eventName) || !profileId) return null;

  const separator = profileId.indexOf(":");
  if (separator < 1) return null;
  const entityType = profileId.slice(0, separator);
  const entityId = profileId.slice(separator + 1);
  if (!entityId || !["center", "provider", "listing"].includes(entityType)) return null;

  return {
    event_id: payload.event_id,
    anonymous_session_id: directorySessionId(),
    event_name: eventName,
    entity_type: entityType,
    entity_id: entityId,
    category_id: payload.category_id,
    vertical_id: payload.vertical_id,
    municipality: payload.municipality,
    search_id: payload.search_id,
    result_position: payload.position,
    schema_version: analyticsSchemaVersion
  };
}

export function persistDirectoryEvents(payloads: Record<string, unknown>[]) {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  const events = payloads.map(directoryEvent).filter(Boolean);
  if (!events.length) return;

  void fetch("/api/analytics/directory-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events }),
    keepalive: true
  }).catch(() => {
    // La persistencia operativa nunca debe bloquear la navegación.
  });
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
