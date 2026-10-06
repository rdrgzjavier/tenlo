export type TrackingAction =
  | "view_detail"
  | "contact_whatsapp"
  | "contact_email"
  | "contact_phone"
  | "external_web"
  | "share"
  | "save_favorite"
  | "search"
  | "publish"
  | "claim_profile_click"
  | "claim_profile_submit"
  | "provider_suggestion_started"
  | "provider_suggestion_submitted"
  | "zero_results";

export function trackingAttrs(action: TrackingAction, params: Record<string, string | number | undefined>) {
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

  return Object.fromEntries(
    Object.entries(element.dataset)
      .filter(([key]) => key.startsWith("track"))
      .map(([key, value]) => {
        const name = key === "trackAction" ? "event" : key.replace(/^track/, "").replace(/^[A-Z]/, (letter) => letter.toLowerCase());
        return [name, value];
      })
  );
}
