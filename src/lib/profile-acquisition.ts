import type { User } from "@supabase/supabase-js";
import type { AcquisitionContext } from "@/lib/acquisition";

function acquisitionFromMetadata(metadata: Record<string, unknown> | undefined): AcquisitionContext {
  const value = metadata?.acquisition_context;
  if (!value || typeof value !== "object" || Array.isArray(value)) return { entry_channel: "direct" };
  const raw = value as Record<string, unknown>;
  const safeText = (key: string, maxLength: number) => {
    if (typeof raw[key] !== "string") return undefined;
    const normalized = raw[key].trim().toLowerCase().replace(/\s+/g, "-").slice(0, maxLength);
    if (!normalized || normalized.includes("@") || /(?:\+?34)?[\s.-]*\d(?:[\s.-]*\d){7,}/.test(normalized)) return undefined;
    return normalized;
  };
  const entry = safeText("entry_channel", 20);
  return {
    entry_channel: entry === "campaign" || entry === "organic_search" || entry === "referral" ? entry : "direct",
    traffic_source: safeText("traffic_source", 80),
    traffic_medium: safeText("traffic_medium", 80),
    traffic_campaign: safeText("traffic_campaign", 80),
    traffic_content: safeText("traffic_content", 80),
    landing_path: typeof raw.landing_path === "string" && raw.landing_path.startsWith("/")
      ? raw.landing_path.split(/[?#]/, 1)[0].slice(0, 200)
      : undefined
  };
}

export function acquisitionProfileFields(user: User) {
  const acquisition = acquisitionFromMetadata(user.user_metadata);
  return {
    registration_channel: user.app_metadata?.provider === "google" ? "google" as const : "email" as const,
    acquisition_entry_channel: acquisition.entry_channel,
    acquisition_source: acquisition.traffic_source ?? null,
    acquisition_medium: acquisition.traffic_medium ?? null,
    acquisition_campaign: acquisition.traffic_campaign ?? null,
    acquisition_content: acquisition.traffic_content ?? null,
    acquisition_landing_path: acquisition.landing_path?.startsWith("/") ? acquisition.landing_path : null,
    onboarding_status: "email_confirmed" as const,
    last_significant_activity_at: new Date().toISOString()
  };
}
