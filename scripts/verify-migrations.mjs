import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const migrationsDir = path.join(root, "supabase", "migrations");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

function grantedColumns(sql, table) {
  const match = sql.match(new RegExp(`grant\\s+update\\s*\\(([\\s\\S]*?)\\)\\s+on\\s+public\\.${table}\\s+to\\s+authenticated`, "i"));
  assert(match, `No se encontró el GRANT UPDATE por columnas de ${table}.`);
  return match[1]
    .split(",")
    .map((column) => column.trim().toLowerCase())
    .filter(Boolean);
}

const migrationFiles = (await readdir(migrationsDir))
  .filter((name) => /^\d{4}_.+\.sql$/.test(name))
  .sort();

const numbers = migrationFiles.map((name) => Number(name.slice(0, 4)));
assert(new Set(numbers).size === numbers.length, "Hay números de migración duplicados.");
numbers.forEach((number, index) => {
  assert(number === index + 1, `Falta la migración ${String(index + 1).padStart(4, "0")}.`);
});

const [m24, m25, m26, m27, m28, m29, m30, m31, m32, m33, m34, m35, repository, registration, verification, providerVerification, providerRelevanceVerification] = await Promise.all([
  text("supabase/migrations/0024_directory_performance_events.sql"),
  text("supabase/migrations/0025_public_directory_rpc.sql"),
  text("supabase/migrations/0026_profile_role_hardening.sql"),
  text("supabase/migrations/0027_owner_moderation_hardening.sql"),
  text("supabase/migrations/0028_business_profile_review_queue.sql"),
  text("supabase/migrations/0029_marketing_consent_history.sql"),
  text("supabase/migrations/0030_harden_admin_function_search_paths.sql"),
  text("supabase/migrations/0031_profile_acquisition_and_onboarding.sql"),
  text("supabase/migrations/0032_submission_content_immutability.sql"),
  text("supabase/migrations/0033_profile_activity_tracking.sql"),
  text("supabase/migrations/0034_provider_connection_flow.sql"),
  text("supabase/migrations/0035_provider_lead_relevance.sql"),
  text("src/lib/directory-repository.ts"),
  text("src/components/LoginRegistration.tsx"),
  text("supabase/verification/0024_0025_directory_controls.sql"),
  text("supabase/verification/0034_provider_connection_flow.sql"),
  text("supabase/verification/0035_provider_lead_relevance.sql")
]);

assert(/revoke all on public\.directory_events from anon, authenticated/i.test(m24), "directory_events debe retirar privilegios heredados.");
assert(/grant insert on public\.directory_events to anon, authenticated/i.test(m24), "directory_events debe permitir únicamente la ingesta prevista.");

for (const rpc of ["get_public_centers", "get_public_business_profiles", "get_public_services"]) {
  assert(m25.includes(`function public.${rpc}()`), `Falta el RPC ${rpc}.`);
  assert(repository.includes(`supabase.rpc("${rpc}")`), `El repositorio no consume ${rpc}.`);
  assert(verification.includes(`public.${rpc}()`), `La verificación no comprueba ${rpc}.`);
}
assert(/revoke select on public\.centers, public\.services, public\.business_profiles, public\.listings, public\.community_posts from anon/i.test(m25), "La lectura anónima de tablas base debe estar revocada.");

const profileColumns = grantedColumns(m26, "profiles");
for (const protectedColumn of ["role", "status", "review_notes"]) {
  assert(!profileColumns.includes(protectedColumn), `profiles concede por error ${protectedColumn}.`);
}

const protectedOwnerColumns = [
  "owner_id",
  "status",
  "trust_level",
  "record_origin",
  "source_name",
  "source_url",
  "last_reviewed",
  "external_key"
];
for (const table of ["business_profiles", "services", "listings", "community_posts"]) {
  const columns = grantedColumns(m27, table);
  for (const protectedColumn of protectedOwnerColumns) {
    assert(!columns.includes(protectedColumn), `${table} concede por error ${protectedColumn}.`);
  }
}
for (const additionallyProtected of ["claim_status", "commercial_plan", "completeness_percent"]) {
  assert(!grantedColumns(m27, "business_profiles").includes(additionallyProtected), `business_profiles concede por error ${additionallyProtected}.`);
}
assert(m27.includes("status in ('draft', 'pending_review', 'rejected')"), "Las ediciones del titular deben quedar limitadas a estados no publicados.");

for (const queueTable of ["admin_queue_audit", "admin_queue_notes"]) {
  assert(new RegExp(`${queueTable}[\\s\\S]*business_profile`, "i").test(m28), `${queueTable} no admite business_profile.`);
}
for (const rpc of ["moderate_business_profile", "resubmit_business_profile"]) {
  assert(m28.includes(`function public.${rpc}`), `Falta ${rpc}.`);
  assert(verification.includes(`public.${rpc}`), `La verificación no comprueba ${rpc}.`);
}

assert(/revoke all on public\.consent_history from anon, authenticated/i.test(m29), "consent_history debe retirar privilegios heredados.");
assert(/grant select on public\.consent_history to authenticated/i.test(m29), "El titular debe poder leer su historial mediante RLS.");
assert(/after insert or update of marketing_consent on public\.profiles/i.test(m29), "Falta el trigger del historial de consentimiento.");
for (const functionName of ["is_tenlo_admin", "audit_admin_queue_status"]) {
  assert(m30.includes(`alter function public.${functionName}()`), `0030 no endurece ${functionName}.`);
  assert(m30.includes("set search_path = ''"), "0030 debe fijar un search_path vacío.");
}

for (const column of ["registration_channel", "acquisition_entry_channel", "acquisition_source", "acquisition_medium", "acquisition_campaign", "acquisition_content", "acquisition_landing_path", "onboarding_status", "last_significant_activity_at"]) {
  assert(m31.includes(column), `0031 no prepara ${column}.`);
}
assert(!m31.includes("referrer_host"), "El perfil no debe persistir el host de referencia completo.");
assert(registration.includes("acquisition_context: acquisitionContext"), "El registro no conserva el contexto de adquisición saneado.");

assert(/revoke update on public\.submissions from authenticated/i.test(m32), "0032 debe retirar la actualización general de submissions.");
assert(/grant update \(status\) on public\.submissions to authenticated/i.test(m32), "0032 debe conservar únicamente la actualización de status.");
for (const protectedColumn of ["payload", "review_notes"]) {
  assert(verification.includes(`'public.submissions', '${protectedColumn}', 'update'`), `La verificación no comprueba ${protectedColumn} en submissions.`);
}

assert(/security definer[\s\S]*set search_path = ''/i.test(m33), "0033 debe aislar la función de actividad con search_path vacío.");
assert(/where id = \(select auth\.uid\(\)\)/i.test(m33), "0033 debe limitar la actividad al perfil autenticado.");
assert(!m33.includes("'active' then"), "0033 no debe permitir al cliente autodeclararse activo.");

for (const functionName of ["get_provider_connection_requests", "mark_provider_request_viewed", "respond_to_connection_request"]) {
  assert(m34.includes(`function public.${functionName}`), `0034 debe definir ${functionName}.`);
}
const providerRequestShape = m34.match(/get_provider_connection_requests\(\)\s+returns table \(([\s\S]*?)\)\s+language/i)?.[1] ?? "";
for (const privateColumn of ["family_id", "email", "phone"]) {
  assert(!providerRequestShape.includes(privateColumn), `La bandeja del proveedor expone por error ${privateColumn}.`);
}
assert(/get_provider_connection_requests\(\)[\s\S]*profile\.owner_id = \(select auth\.uid\(\)\)/i.test(m34), "La bandeja del proveedor debe limitarse al titular autenticado.");
assert(/begin\s+--[^]*new\.provider_id := null;/i.test(m34), "La asignación debe descartar cualquier provider_id aportado por el cliente.");
assert(/before insert or update of target_type, target_id on public\.connection_requests/i.test(m34), "La asignación debe ejecutarse en altas y cambios de destino.");
assert(/respond_to_connection_request[\s\S]*next_status not in \('responded', 'declined'\)/i.test(m34), "La respuesta del proveedor solo puede responder o rechazar.");
assert(/revoke all on function public\.get_provider_connection_requests\(\) from public, anon, authenticated/i.test(m34), "El RPC de solicitudes debe retirar la ejecución heredada.");
assert(/security definer[\s\S]*set search_path = ''/i.test(m34), "0034 debe aislar las funciones privilegiadas con search_path vacío.");
for (const functionName of ["get_provider_connection_requests", "mark_provider_request_viewed", "respond_to_connection_request"]) {
  assert(providerVerification.includes(`public.${functionName}`), `La verificación post-despliegue no comprueba ${functionName}.`);
}
assert(providerVerification.includes("connection_requests_provider_created_idx"), "La verificación post-despliegue no comprueba el índice del proveedor.");
assert(providerVerification.includes("assign_connection_request_provider"), "La verificación post-despliegue no comprueba el trigger de asignación.");

for (const functionName of ["get_provider_connection_requests_v2", "respond_to_connection_request_v2"]) {
  assert(m35.includes(`function public.${functionName}`), `0035 debe definir ${functionName}.`);
  assert(providerRelevanceVerification.includes(`public.${functionName}`), `La verificación post-despliegue no comprueba ${functionName}.`);
}
const providerRequestShapeV2 = m35.match(/get_provider_connection_requests_v2\(\)\s+returns table \(([\s\S]*?)\)\s+language/i)?.[1] ?? "";
for (const privateColumn of ["family_id", "email", "phone"]) {
  assert(!providerRequestShapeV2.includes(privateColumn), `La bandeja v2 del proveedor expone por error ${privateColumn}.`);
}
assert(providerRequestShapeV2.includes("relevance text"), "La bandeja v2 debe devolver la relevancia estructurada.");
assert(/respond_to_connection_request_v2[\s\S]*lead_relevance not in \('relevant', 'irrelevant'\)/i.test(m35), "La relevancia debe quedar limitada a valores estructurados.");
assert(/get_provider_connection_requests_v2\(\)[\s\S]*profile\.owner_id = \(select auth\.uid\(\)\)/i.test(m35), "La bandeja v2 debe limitarse al titular autenticado.");
assert(/revoke all on function public\.get_provider_connection_requests_v2\(\) from public, anon, authenticated/i.test(m35), "El RPC v2 debe retirar la ejecución heredada.");
assert(/security definer[\s\S]*set search_path = ''/i.test(m35), "0035 debe aislar las funciones privilegiadas con search_path vacío.");

console.log(`Migraciones verificadas: ${migrationFiles.length} archivos, secuencia 0001-${String(numbers.at(-1)).padStart(4, "0")}.`);
console.log("Contratos comprobados: directorio público, permisos por columna, moderación, consentimiento y search_path.");
