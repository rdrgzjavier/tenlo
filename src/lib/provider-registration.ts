import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, Json, ProfileRole } from "@/lib/supabase/types";

type ProviderRegistrationData = {
  category: string;
  subtype: string;
  website: string;
  description: string;
  serviceArea: string;
  modality: string;
  ageRange: string;
  availability: string;
  schedule: string;
  hourlyRate: string;
  confirmationNotice: string;
  careType: string;
  verificationInfo: string;
  experience: string;
  credential: string;
  insurance: string;
  characteristics: string;
};

const providerRoles = new Set<ProfileRole>([
  "school",
  "nursery",
  "shop",
  "sports_center",
  "activity_provider",
  "technology_provider",
  "transport_provider",
  "event_provider",
  "teacher",
  "childcare",
  "health_wellness",
  "camp_provider",
  "community_org"
]);

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function providerRegistrationFromMetadata(metadata: Record<string, unknown> | undefined): ProviderRegistrationData | null {
  const raw = objectValue(metadata?.provider_profile);
  if (!raw) return null;

  const data: ProviderRegistrationData = {
    category: text(raw.category, 120),
    subtype: text(raw.subtype, 120),
    website: text(raw.website, 500),
    description: text(raw.description, 2000),
    serviceArea: text(raw.service_area, 500),
    modality: text(raw.modality, 120),
    ageRange: text(raw.age_range, 160),
    availability: text(raw.availability, 300),
    schedule: text(raw.schedule, 1000),
    hourlyRate: text(raw.hourly_rate, 120),
    confirmationNotice: text(raw.confirmation_notice, 120),
    careType: text(raw.care_type, 120),
    verificationInfo: text(raw.verification_info, 300),
    experience: text(raw.experience, 1500),
    credential: text(raw.credential, 300),
    insurance: text(raw.insurance, 300),
    characteristics: text(raw.characteristics, 1500)
  };

  return data.category && data.description ? data : null;
}

export function isProviderRole(role: ProfileRole) {
  return providerRoles.has(role);
}

function compactDetails(data: ProviderRegistrationData): Json {
  return Object.fromEntries(
    Object.entries({
      modality: data.modality,
      age_range: data.ageRange,
      availability: data.availability,
      schedule: data.schedule,
      hourly_rate: data.hourlyRate,
      confirmation_notice: data.confirmationNotice,
      care_type: data.careType,
      verification_info: data.verificationInfo,
      experience: data.experience,
      credential: data.credential,
      insurance: data.insurance,
      characteristics: data.characteristics
    }).filter(([, value]) => Boolean(value))
  );
}

export async function ensurePendingBusinessProfile(
  supabase: SupabaseClient<Database>,
  user: Pick<User, "id" | "email" | "user_metadata">,
  role: ProfileRole,
  displayName: string,
  phone: string | null,
  municipality: string | null
) {
  if (!isProviderRole(role)) return null;

  const registration = providerRegistrationFromMetadata(user.user_metadata);
  if (!registration) return null;

  const { data: existing, error: lookupError } = await supabase
    .from("business_profiles")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("business_profiles")
    .insert({
      owner_id: user.id,
      business_name: displayName,
      website: registration.website || null,
      municipality,
      service_area: registration.serviceArea || municipality,
      category: registration.category,
      subtype: registration.subtype || null,
      description: registration.description,
      phone,
      contact_email: user.email ?? null,
      details: compactDetails(registration),
      accepts_requests: false,
      contact_preferences: [],
      trust_level: "collected",
      status: "pending_review",
      claim_status: "unclaimed",
      commercial_plan: "free",
      completeness_percent: 0,
      record_origin: "user_submitted",
      location_visibility: "service_area",
      service_municipalities: municipality ? [municipality] : []
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}
