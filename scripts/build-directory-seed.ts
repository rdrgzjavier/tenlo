import { centers, listings, providers } from "../src/lib/mock-data";

function hasPublicSource(sourceUrl?: string) {
  return Boolean(sourceUrl?.startsWith("https://") || sourceUrl?.startsWith("http://"));
}

// Solo entran fichas revisadas una a una. Tener URL no basta para ser importable.
// Las salas 2 y 3 de Hanky Planet deben ser servicios del mismo proveedor, no proveedores duplicados.
const auditedProviderIds = new Set([
  "boadilla-beone",
  "pozuelo-kumon",
  "majadahonda-kidsus",
  "hanky-planet-las-rozas-sala-1",
  "ilusiona-equinoccio-majadahonda",
  "piccoli-majadahonda",
  "centro-juvenil-principe-asturias",
  "espacio-cultural-mira-pozuelo",
  "hop-galaxy-boadilla",
  "el-miniclub-boadilla",
  "club-las-encinas-boadilla",
]);

// Algunos registros mock representan servicios de una misma entidad. Esta tabla
// evita crear proveedores duplicados y conserva las fichas como servicios.
const canonicalProviderIdBySourceId = new Map<string, string>([
  ["hanky-planet-las-rozas-sala-2", "hanky-planet-las-rozas-sala-1"],
  ["hanky-planet-las-rozas-sala-3", "hanky-planet-las-rozas-sala-1"],
]);

const auditedServiceProviderIds = new Set([
  ...auditedProviderIds,
  ...canonicalProviderIdBySourceId.keys(),
]);

const importableCenters = centers.filter((center) => hasPublicSource(center.sourceUrl));
const importableProviders = providers.filter(
  (provider) => auditedProviderIds.has(provider.id) && hasPublicSource(provider.sourceUrl),
);
const importableListings = listings.filter(
  (listing) => listing.publicationType === "proveedor" && auditedServiceProviderIds.has(listing.userId),
);

const personalProviderIds = new Set(["profesor-mates", "canguro-ana", "canguro-laura"]);
const organizationalProviders = providers.filter((provider) => !personalProviderIds.has(provider.id));
const uniqueOrganizationalProviderIds = new Set(
  organizationalProviders.map((provider) => canonicalProviderIdBySourceId.get(provider.id) ?? provider.id),
);

if (process.argv.includes("--summary")) {
  process.stdout.write(`${JSON.stringify({
    sourceInventory: { centers: centers.length, providers: providers.length, listings: listings.length },
    pilotInventory: {
      centers: centers.length,
      organizationalProviderRecords: organizationalProviders.length,
      uniqueOrganizationalProviders: uniqueOrganizationalProviderIds.size,
      excludedFictitiousPersonalProfiles: personalProviderIds.size,
    },
    importable: {
      centers: importableCenters.length,
      providers: importableProviders.length,
      services: importableListings.length,
    },
    pendingSourceReviewOrNormalization: {
      centers: centers.length - importableCenters.length,
      uniqueOrganizationalProviders: uniqueOrganizationalProviderIds.size - importableProviders.length,
    },
    trustLevel: "collected",
    claimed: false,
  }, null, 2)}\n`);
  process.exit(0);
}

function literal(value: unknown): string {
  if (value === undefined || value === null || value === "") return "null";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return `'${text.replaceAll("'", "''")}'`;
}

function textArray(values: string[]) {
  return `array[${values.map(literal).join(", ")}]::text[]`;
}

function reviewedDate(value?: string) {
  if (!value) return "null";
  const match = value.match(/(20\d{2})/);
  return match ? literal(`${match[1]}-05-01`) : "null";
}

const statements: string[] = [
  "begin;",
  "",
  "-- Centros educativos: publicados, pero inicialmente no verificados.",
];

for (const center of importableCenters) {
  statements.push(`insert into public.centers (
  external_key, slug, name, municipality, center_type, religious_character,
  stages, languages, services, description, address, phone, email, website,
  source_name, source_url, last_reviewed, trust_level, tags, image_url, status, record_origin
) values (
  ${literal(center.id)}, ${literal(center.slug)}, ${literal(center.name)}, ${literal(center.municipality)},
  ${literal(center.type)}, ${literal(center.religiousCharacter)}, ${textArray(center.stages)},
  ${textArray(center.languages)}, ${textArray(center.services)}, ${literal(center.description)},
  ${literal(center.address)}, ${literal(center.phone)}, ${literal(center.email)}, ${literal(center.website)},
  ${literal(center.source)}, ${literal(center.sourceUrl)}, ${reviewedDate(center.lastReviewed)},
  'collected', ${textArray(center.tags)}, ${literal(center.image)}, 'approved', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  name = excluded.name,
  municipality = excluded.municipality,
  center_type = excluded.center_type,
  religious_character = excluded.religious_character,
  stages = excluded.stages,
  languages = excluded.languages,
  services = excluded.services,
  description = excluded.description,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  tags = excluded.tags,
  image_url = excluded.image_url,
  status = 'approved',
  record_origin = 'tenlo_curated';`);
}

statements.push("", "-- Proveedores no reclamados: sin propietario ficticio.");
for (const provider of importableProviders) {
  statements.push(`insert into public.business_profiles (
  external_key, owner_id, business_name, website, municipality, service_area, category,
  trust_level, status, source_name, source_url, last_reviewed, claim_status,
  commercial_plan, description, phone, contact_email, tags, image_url, record_origin, details
) values (
  ${literal(provider.id)}, null, ${literal(provider.businessName)}, ${literal(provider.website)},
  ${literal(provider.municipality)}, ${literal(provider.serviceArea)}, ${literal(provider.category)},
  'collected', 'approved', ${literal(provider.sourceName)}, ${literal(provider.sourceUrl)},
  ${reviewedDate(provider.lastReviewed)}, 'unclaimed', 'free', ${literal(provider.description)},
  ${literal(provider.phone)}, ${literal(provider.email)}, ${textArray(provider.tags)},
  ${literal(provider.image)}, 'tenlo_curated', '{}'::jsonb
) on conflict (external_key) where external_key is not null do update set
  business_name = excluded.business_name,
  website = excluded.website,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  category = excluded.category,
  trust_level = 'collected',
  status = 'approved',
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  claim_status = case when public.business_profiles.claim_status = 'unclaimed' then 'unclaimed' else public.business_profiles.claim_status end,
  description = excluded.description,
  phone = excluded.phone,
  contact_email = excluded.contact_email,
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.business_profiles.owner_id is null
  and public.business_profiles.record_origin = 'tenlo_curated';`);
}

statements.push("", "-- Servicios y fichas navegables. Las relaciones se resuelven por claves estables.");
for (const listing of importableListings) {
  const canonicalProviderId = canonicalProviderIdBySourceId.get(listing.userId) ?? listing.userId;
  const canonicalProvider = providers.find((provider) => provider.id === canonicalProviderId);
  const isNormalizedChildService = canonicalProviderId !== listing.userId;
  const serviceSourceName = isNormalizedChildService ? canonicalProvider?.sourceName : listing.sourceName;
  const serviceSourceUrl = isNormalizedChildService ? canonicalProvider?.sourceUrl : listing.sourceUrl;

  statements.push(`insert into public.services (
  external_key, owner_id, business_profile_id, slug, title, category_id, municipality,
  service_area, description, age_min, age_max, price_label, availability, contact_email,
  phone, website, source_name, source_url, last_reviewed, trust_level, status, tags,
  image_url, record_origin
) values (
  ${literal(listing.id)}, null,
  (select id from public.business_profiles where external_key = ${literal(canonicalProviderId)}),
  ${literal(listing.slug)}, ${literal(listing.title)}, ${literal(listing.categoryId)},
  ${literal(listing.municipality)}, ${literal(listing.area)}, ${literal(listing.description)},
  ${literal(listing.recommendedAgeMin)}, ${literal(listing.recommendedAgeMax)},
  ${literal(listing.priceLabel)}, ${literal(listing.availability)}, ${literal(listing.details.Email)},
  ${literal(listing.details.Contacto)}, ${literal(listing.details.Web === "No indicado" ? "" : listing.details.Web)},
  ${literal(serviceSourceName)}, ${literal(serviceSourceUrl)}, ${reviewedDate(listing.lastReviewed)},
  'collected', 'approved', ${textArray(listing.tags)}, ${literal(listing.image)}, 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  business_profile_id = excluded.business_profile_id,
  title = excluded.title,
  category_id = excluded.category_id,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  description = excluded.description,
  age_min = excluded.age_min,
  age_max = excluded.age_max,
  price_label = excluded.price_label,
  availability = excluded.availability,
  contact_email = excluded.contact_email,
  phone = excluded.phone,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  status = 'approved',
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.services.owner_id is null
  and public.services.record_origin = 'tenlo_curated';`);
}

statements.push(
  "",
  `-- Comprobaciones esperadas para este lote: ${importableCenters.length} centros, ${importableProviders.length} proveedores y ${importableListings.length} servicios.`,
  "select record_origin, count(*) from public.centers group by record_origin order by record_origin;",
  "select record_origin, claim_status, count(*) from public.business_profiles group by record_origin, claim_status order by record_origin, claim_status;",
  "select record_origin, status, count(*) from public.services group by record_origin, status order by record_origin, status;",
  "select count(*) as services_without_provider from public.services where record_origin = 'tenlo_curated' and business_profile_id is null;",
  "",
  "commit;",
);

process.stdout.write(`${statements.join("\n\n")}\n`);

