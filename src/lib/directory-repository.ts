import "server-only";

import { centerTypeLabel } from "@/lib/display-labels";
import { centers as mockCenters, listings as mockListings, providers as mockProviders } from "@/lib/mock-data";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { hasSupabaseServerConfig } from "@/lib/supabase/server";
import type { Center, CenterType, Listing, Provider, TrustLevel } from "@/lib/types";

export type DirectorySnapshot = {
  centers: Center[];
  providers: Provider[];
  listings: Listing[];
  source: "mock" | "supabase";
  fallbackReason?: "not_enabled" | "missing_config" | "query_failed" | "empty_directory";
};

type CenterRow = {
  public_id: string;
  external_key: string | null;
  slug: string;
  name: string;
  municipality: string;
  center_type: string;
  religious_character: Center["religiousCharacter"] | null;
  stages: string[];
  languages: string[];
  services: string[];
  description: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  source_name: string | null;
  source_url: string | null;
  last_reviewed: string | null;
  trust_level: TrustLevel;
  tags: string[];
  image_url: string | null;
};

type BusinessRow = {
  public_id: string;
  external_key: string | null;
  business_name: string;
  category: string;
  description: string | null;
  municipality: string | null;
  service_area: string | null;
  website: string | null;
  phone: string | null;
  contact_email: string | null;
  source_name: string | null;
  source_url: string | null;
  last_reviewed: string | null;
  trust_level: TrustLevel;
  commercial_plan: string;
  accepts_requests: boolean;
  tags: string[];
  image_url: string | null;
};

type ServiceRow = {
  public_id: string;
  external_key: string | null;
  business_public_id: string | null;
  slug: string;
  title: string;
  category_id: string;
  municipality: string;
  service_area: string | null;
  description: string;
  age_min: number | null;
  age_max: number | null;
  price_label: string | null;
  availability: string | null;
  contact_email: string | null;
  phone: string | null;
  website: string | null;
  source_name: string | null;
  source_url: string | null;
  last_reviewed: string | null;
  trust_level: TrustLevel;
  tags: string[];
  image_url: string | null;
};

function mockSnapshot(fallbackReason: DirectorySnapshot["fallbackReason"]): DirectorySnapshot {
  return {
    centers: mockCenters,
    providers: mockProviders,
    listings: mockListings,
    source: "mock",
    fallbackReason,
  };
}

function isCenterType(value: string): value is CenterType {
  return value === "publico" || value === "concertado" || value === "privado";
}

function formatReviewDate(value: string | null) {
  if (!value) return undefined;
  return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

function trustStatus(level: TrustLevel) {
  if (level === "official") return "Información confirmada por la entidad";
  if (level === "verified") return "Datos esenciales verificados por Tenlo";
  if (level === "managed") return "Ficha gestionada por la entidad";
  return "Pendiente de verificación";
}

function isVerifiedTrust(level: TrustLevel) {
  return level === "verified" || level === "official";
}

function mapCenter(row: CenterRow): Center {
  const type = isCenterType(row.center_type) ? row.center_type : "privado";
  return {
    id: row.public_id,
    slug: row.slug,
    name: row.name,
    type,
    religiousCharacter: row.religious_character ?? "no indicado",
    stages: row.stages,
    municipality: row.municipality,
    address: row.address ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    website: row.website ?? "",
    languages: row.languages,
    services: row.services,
    description: row.description,
    source: row.source_name ?? "",
    sourceUrl: row.source_url ?? undefined,
    lastReviewed: formatReviewDate(row.last_reviewed),
    verificationStatus: trustStatus(row.trust_level),
    isPublicInformation: Boolean(row.source_url),
    tags: row.tags,
    image: row.image_url ?? undefined,
    verified: isVerifiedTrust(row.trust_level),
    trustLevel: row.trust_level,
  };
}

function mapProvider(row: BusinessRow): Provider {
  return {
    id: row.public_id,
    userId: row.public_id,
    businessName: row.business_name,
    category: row.category,
    description: row.description ?? "",
    municipality: row.municipality ?? "",
    serviceArea: row.service_area ?? row.municipality ?? "",
    website: row.website ?? "",
    phone: row.phone ?? "",
    email: row.contact_email ?? "",
    acceptsRequests: row.accepts_requests,
    sourceName: row.source_name ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    lastReviewed: formatReviewDate(row.last_reviewed),
    verificationStatus: trustStatus(row.trust_level),
    isPublicInformation: Boolean(row.source_url),
    verified: isVerifiedTrust(row.trust_level),
    trustLevel: row.trust_level,
    plan: row.commercial_plan === "premium" ? "premium" : row.commercial_plan === "featured" || row.commercial_plan === "destacado" ? "destacado" : "gratuito",
    tags: row.tags,
    image: row.image_url ?? undefined,
  };
}

function centerListing(center: Center): Listing {
  return {
    id: `ficha-${center.id}`,
    slug: center.slug,
    userId: "tenlo",
    categoryId: "centros",
    centerId: center.id,
    title: center.name,
    description: center.description,
    municipality: center.municipality,
    area: center.municipality,
    priceLabel: "Consultar",
    availability: "Ficha pública",
    sourceName: center.source,
    sourceUrl: center.sourceUrl,
    lastReviewed: center.lastReviewed,
    verificationStatus: center.verificationStatus,
    isPublicInformation: center.isPublicInformation,
    publicationType: "centro",
    status: "published",
    verified: isVerifiedTrust(center.trustLevel),
    trustLevel: center.trustLevel,
    image: center.image,
    tags: center.tags,
    details: {
      Tipo: centerTypeLabel(center.type),
      Etapas: center.stages.join(", "),
      Teléfono: center.phone,
      Web: center.website,
    },
  };
}

function mapService(row: ServiceRow, providerById: Map<string, Provider>): Listing {
  const provider = row.business_public_id ? providerById.get(row.business_public_id) : undefined;
  return {
    id: row.public_id,
    slug: row.slug,
    userId: provider?.id ?? "tenlo",
    categoryId: row.category_id,
    title: row.title,
    description: row.description,
    municipality: row.municipality,
    area: row.service_area ?? row.municipality,
    recommendedAgeMin: row.age_min ?? undefined,
    recommendedAgeMax: row.age_max ?? undefined,
    priceLabel: row.price_label ?? undefined,
    availability: row.availability ?? undefined,
    acceptsRequests: provider?.acceptsRequests ?? false,
    sourceName: row.source_name ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    lastReviewed: formatReviewDate(row.last_reviewed),
    verificationStatus: trustStatus(row.trust_level),
    isPublicInformation: Boolean(row.source_url),
    publicationType: "proveedor",
    status: "published",
    verified: isVerifiedTrust(row.trust_level),
    trustLevel: row.trust_level,
    tags: row.tags,
    image: row.image_url ?? undefined,
    details: {
      Contacto: row.phone ?? provider?.phone ?? "",
      Email: row.contact_email ?? provider?.email ?? "",
      Horario: row.availability ?? "Consultar disponibilidad",
      Web: row.website ?? provider?.website ?? "No indicado",
    },
  };
}

export async function loadDirectorySnapshot(): Promise<DirectorySnapshot> {
  if (process.env.DIRECTORY_DATA_SOURCE !== "supabase") return mockSnapshot("not_enabled");
  if (!hasSupabaseServerConfig()) return mockSnapshot("missing_config");

  const supabase = createSupabasePublicClient();
  const [centerResult, businessResult, serviceResult] = await Promise.all([
    supabase.rpc("get_public_centers"),
    supabase.rpc("get_public_business_profiles"),
    supabase.rpc("get_public_services"),
  ]);

  if (centerResult.error || businessResult.error || serviceResult.error) return mockSnapshot("query_failed");
  if (!centerResult.data?.length || !businessResult.data?.length || !serviceResult.data?.length) {
    return mockSnapshot("empty_directory");
  }

  const centers = (centerResult.data as CenterRow[]).map(mapCenter);
  const businesses = businessResult.data as BusinessRow[];
  const providers = businesses.map(mapProvider);
  const providerByPublicId = new Map(businesses.map((row, index) => [row.public_id, providers[index]]));
  const listings = [
    ...centers.map(centerListing),
    ...(serviceResult.data as ServiceRow[]).map((row) => mapService(row, providerByPublicId)),
  ];

  return { centers, providers, listings, source: "supabase" };
}

