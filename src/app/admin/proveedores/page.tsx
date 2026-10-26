import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, ArrowLeft, BriefcaseBusiness, CheckCircle2, Clock3, Inbox, UsersRound } from "lucide-react";
import PrivateAreaUnavailable from "@/components/PrivateAreaUnavailable";
import ReportPeriodSelector, { resolveReportPeriod } from "@/components/ReportPeriodSelector";
import ReportSegmentFilters from "@/components/ReportSegmentFilters";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proveedores del piloto | Tenlo",
  robots: { index: false, follow: false }
};

type BusinessProfile = {
  id: string;
  external_key: string | null;
  owner_id: string | null;
  category: string;
  municipality: string | null;
  status: string;
  completeness_percent: number;
  accepts_requests: boolean;
  created_at: string;
};

type ProviderProfile = {
  id: string;
  role: string;
  onboarding_status: string;
  last_significant_activity_at: string | null;
  created_at: string;
};

type ClaimRequest = {
  entity_type: string;
  entity_id: string;
  status: string;
  created_at: string;
};

type ConnectionRequest = {
  provider_id: string | null;
  target_id: string | null;
  status: string;
  relevance: "relevant" | "irrelevant" | null;
  first_response_at: string | null;
  created_at: string;
};

type ServiceReference = {
  id: string;
  external_key: string | null;
  business_profile_id: string | null;
};

type ApprovalAudit = {
  record_id: string;
  changed_at: string;
};

type SegmentRow = {
  label: string;
  profiles: number;
  approved: number;
  complete: number;
  available: number;
};

const providerRoles = new Set([
  "school", "nursery", "shop", "sports_center", "activity_provider", "technology_provider",
  "transport_provider", "event_provider", "teacher", "childcare", "health_wellness",
  "camp_provider", "community_org"
]);

function dateLabel(value: Date) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(value);
}

function percentage(part: number, total: number) {
  return total ? `${Math.round((part / total) * 100)} %` : "Sin datos";
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function durationLabel(milliseconds: number | null) {
  if (milliseconds === null) return "Sin datos";
  const hours = milliseconds / 3_600_000;
  return hours < 48 ? `${hours.toFixed(hours < 10 ? 1 : 0)} h` : `${(hours / 24).toFixed(1)} días`;
}

function segmentRows(profiles: BusinessProfile[], selector: (profile: BusinessProfile) => string) {
  const groups = new Map<string, SegmentRow>();
  profiles.forEach((profile) => {
    const label = selector(profile) || "No indicado";
    const row = groups.get(label) ?? { label, profiles: 0, approved: 0, complete: 0, available: 0 };
    row.profiles += 1;
    row.approved += profile.status === "approved" ? 1 : 0;
    row.complete += profile.completeness_percent >= 75 ? 1 : 0;
    row.available += profile.accepts_requests ? 1 : 0;
    groups.set(label, row);
  });
  return [...groups.values()].sort((a, b) => b.profiles - a.profiles || a.label.localeCompare(b.label, "es"));
}

function SegmentTable({ title, description, rows }: { title: string; description: string; rows: SegmentRow[] }) {
  return (
    <section className="card p-5 md:p-6">
      <h2 className="subsection-title text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      {rows.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-sm"><thead className="border-b border-line text-xs uppercase tracking-wide text-muted"><tr><th className="pb-3 pr-4">Segmento</th><th className="pb-3 pr-4 text-right">Fichas</th><th className="pb-3 pr-4 text-right">Aprobadas</th><th className="pb-3 pr-4 text-right">≥ 75 %</th><th className="pb-3 text-right">Aceptan solicitudes</th></tr></thead><tbody>{rows.map((row) => <tr key={row.label} className="border-b border-line last:border-0"><th scope="row" className="py-3 pr-4 font-semibold text-ink">{row.label}</th><td className="py-3 pr-4 text-right text-slatecopy">{row.profiles}</td><td className="py-3 pr-4 text-right text-slatecopy">{row.approved}</td><td className="py-3 pr-4 text-right text-slatecopy">{row.complete}</td><td className="py-3 text-right text-slatecopy">{row.available}</td></tr>)}</tbody></table></div> : <p className="mt-5 rounded-2xl border border-line bg-soft p-4 text-sm text-muted">Todavía no hay oferta en este segmento.</p>}
    </section>
  );
}

export default async function AdminProvidersPage({ searchParams }: { searchParams: Promise<{ period?: string; category?: string; municipality?: string }> }) {
  if (!hasSupabaseServerConfig()) return <PrivateAreaUnavailable />;

  const { period: rawPeriod, category: rawCategory, municipality: rawMunicipality } = await searchParams;
  const period = resolveReportPeriod(rawPeriod);
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=/admin/proveedores");

  const { data: adminProfile } = await supabase.from("profiles").select("role,status").eq("id", authData.user.id).maybeSingle();
  if (adminProfile?.role !== "tenlo_admin" || adminProfile.status !== "approved") redirect("/area-personal");

  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - period);
  const [businessResult, profilesResult, claimsResult, connectionsResult, servicesResult, approvalsResult] = await Promise.all([
    supabase.from("business_profiles").select("id,external_key,owner_id,category,municipality,status,completeness_percent,accepts_requests,created_at").limit(5000),
    supabase.from("profiles").select("id,role,onboarding_status,last_significant_activity_at,created_at").limit(5000),
    supabase.from("claim_requests").select("entity_type,entity_id,status,created_at").gte("created_at", periodStart.toISOString()).limit(5000),
    supabase.from("connection_requests").select("provider_id,target_id,status,relevance,first_response_at,created_at").gte("created_at", periodStart.toISOString()).limit(5000),
    supabase.from("services").select("id,external_key,business_profile_id").limit(5000),
    supabase.from("admin_queue_audit").select("record_id,changed_at").eq("queue", "business_profile").eq("new_status", "approved").gte("changed_at", periodStart.toISOString()).limit(5000)
  ]);

  const allBusinesses = (businessResult.data ?? []) as BusinessProfile[];
  const categoryOptions = [...new Set(allBusinesses.map((profile) => profile.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  const municipalityOptions = [...new Set(allBusinesses.flatMap((profile) => profile.municipality ? [profile.municipality] : []))].sort((a, b) => a.localeCompare(b, "es"));
  const activeCategory = rawCategory && categoryOptions.includes(rawCategory) ? rawCategory : "";
  const activeMunicipality = rawMunicipality && municipalityOptions.includes(rawMunicipality) ? rawMunicipality : "";
  const businesses = allBusinesses.filter((profile) => (
    (!activeCategory || profile.category === activeCategory)
    && (!activeMunicipality || profile.municipality === activeMunicipality)
  ));
  const businessIds = new Set(businesses.map((profile) => profile.id));
  const businessPublicIds = new Map(allBusinesses.flatMap((profile) => [profile.id, profile.external_key].filter(Boolean).map((value) => [value as string, profile.id] as const)));
  const serviceBusinessIds = new Map(((servicesResult.data ?? []) as ServiceReference[]).flatMap((service) => service.business_profile_id
    ? [service.id, service.external_key].filter(Boolean).map((value) => [value as string, service.business_profile_id as string] as const)
    : []
  ));
  const requestBusinessId = (request: ConnectionRequest) => request.provider_id || (request.target_id ? serviceBusinessIds.get(request.target_id) || businessPublicIds.get(request.target_id) : null);
  const requests = ((connectionsResult.data ?? []) as ConnectionRequest[]).filter((request) => {
    const businessId = requestBusinessId(request);
    return Boolean(businessId && businessIds.has(businessId));
  });
  const claims = ((claimsResult.data ?? []) as ClaimRequest[]).filter((claim) => claim.entity_type === "provider" && businessIds.has(businessPublicIds.get(claim.entity_id) ?? ""));
  const profiles = (profilesResult.data ?? []) as ProviderProfile[];
  const ownerIds = new Set(businesses.flatMap((profile) => profile.owner_id ? [profile.owner_id] : []));
  const providerAccounts = profiles.filter((profile) => providerRoles.has(profile.role) && ownerIds.has(profile.id));
  const activeWithin = (days: number) => {
    const cutoff = Date.now() - days * 86_400_000;
    return providerAccounts.filter((profile) => profile.last_significant_activity_at && new Date(profile.last_significant_activity_at).getTime() >= cutoff).length;
  };
  const approvedProfiles = businesses.filter((profile) => profile.status === "approved").length;
  const completeProfiles = businesses.filter((profile) => profile.completeness_percent >= 75).length;
  const acceptingRequests = businesses.filter((profile) => profile.accepts_requests).length;
  const profilesSubmitted = businesses.filter((profile) => new Date(profile.created_at) >= periodStart).length;
  const newProviderAccounts = providerAccounts.filter((profile) => new Date(profile.created_at) >= periodStart).length;
  const approvals = ((approvalsResult.data ?? []) as ApprovalAudit[]).filter((approval) => businessIds.has(approval.record_id));
  const responseTimes = requests.flatMap((request) => request.first_response_at ? [new Date(request.first_response_at).getTime() - new Date(request.created_at).getTime()] : []).filter((duration) => duration >= 0);
  const respondedRequests = requests.filter((request) => request.first_response_at || ["responded", "declined", "closed"].includes(request.status)).length;
  const ratedRequests = requests.filter((request) => request.relevance);
  const relevantRequests = ratedRequests.filter((request) => request.relevance === "relevant").length;
  const providersWithRequests = new Set(requests.flatMap((request) => {
    const businessId = requestBusinessId(request);
    return businessId ? [businessId] : [];
  })).size;
  const queryError = businessResult.error || profilesResult.error || claimsResult.error || connectionsResult.error || servicesResult.error || approvalsResult.error;

  return (
    <main className="section-shell">
      <Link href="/admin" className="inline-flex min-h-11 items-center gap-2 font-bold text-ink underline"><ArrowLeft size={18} aria-hidden />Volver a operación</Link>
      <p className="label mt-6">Informe interno</p>
      <h1 className="page-title">Proveedores del piloto</h1>
      <p className="lead max-w-4xl">Oferta disponible y avance desde el registro hasta la primera respuesta. Periodo del {dateLabel(periodStart)} al {dateLabel(new Date())}.</p>
      <ReportPeriodSelector activePeriod={period} pathname="/admin/proveedores" preservedParams={{ category: activeCategory, municipality: activeMunicipality }} />
      <ReportSegmentFilters activeCategory={activeCategory} activeMunicipality={activeMunicipality} activePeriod={period} categoryOptions={categoryOptions} municipalityOptions={municipalityOptions} pathname="/admin/proveedores" />

      {queryError ? <p className="mt-6 rounded-2xl border border-coral/30 bg-coral/10 p-4 text-sm font-semibold text-coral">No se ha podido cargar una parte del informe. Comprueba las políticas administrativas y vuelve a intentarlo.</p> : null}

      <section className="card mt-6 p-5 md:p-6" aria-labelledby="provider-stock-title">
        <div className="flex items-center gap-3"><BriefcaseBusiness size={22} className="text-ink" aria-hidden /><div><h2 id="provider-stock-title" className="subsection-title text-ink">Estado actual de la oferta</h2><p className="mt-1 text-sm text-muted">Fotografía actual del segmento seleccionado; no es una cohorte temporal.</p></div></div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Fichas identificadas</dt><dd className="mt-2 text-3xl font-black text-ink">{businesses.length}</dd></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Con titular registrado</dt><dd className="mt-2 text-3xl font-black text-ink">{ownerIds.size}</dd><p className="mt-1 text-xs text-muted">{percentage(ownerIds.size, businesses.length)} de las fichas</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Completitud ≥ 75 %</dt><dd className="mt-2 text-3xl font-black text-ink">{completeProfiles}</dd><p className="mt-1 text-xs text-muted">{percentage(completeProfiles, businesses.length)}</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Aprobadas</dt><dd className="mt-2 text-3xl font-black text-ink">{approvedProfiles}</dd><p className="mt-1 text-xs text-muted">Moderación, no verificación</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Aceptan solicitudes</dt><dd className="mt-2 text-3xl font-black text-ink">{acceptingRequests}</dd><p className="mt-1 text-xs text-muted">{percentage(acceptingRequests, businesses.length)}</p></div>
        </dl>
      </section>

      <section className="card mt-6 p-5 md:p-6" aria-labelledby="provider-flow-title">
        <div className="flex items-center gap-3"><UsersRound size={22} className="text-ink" aria-hidden /><div><h2 id="provider-flow-title" className="subsection-title text-ink">Captación y activación en {period} días</h2><p className="mt-1 text-sm text-muted">Altas, reclamaciones, moderación y solicitudes del periodo seleccionado.</p></div></div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Cuentas proveedoras nuevas</dt><dd className="mt-2 text-3xl font-black text-ink">{newProviderAccounts}</dd></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Reclamaciones iniciadas</dt><dd className="mt-2 text-3xl font-black text-ink">{claims.length}</dd></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Fichas profesionales creadas</dt><dd className="mt-2 text-3xl font-black text-ink">{profilesSubmitted}</dd></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Aprobaciones registradas</dt><dd className="mt-2 text-3xl font-black text-ink">{approvals.length}</dd></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Inbox size={16} aria-hidden />Solicitudes asignables</dt><dd className="mt-2 text-3xl font-black text-ink">{requests.length}</dd><p className="mt-1 text-xs text-muted">{providersWithRequests} proveedores alcanzados</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><CheckCircle2 size={16} aria-hidden />Primeras respuestas</dt><dd className="mt-2 text-3xl font-black text-ink">{respondedRequests}</dd><p className="mt-1 text-xs text-muted">{percentage(respondedRequests, requests.length)} de las solicitudes</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Clock3 size={16} aria-hidden />Mediana hasta respuesta</dt><dd className="mt-2 text-3xl font-black text-ink">{durationLabel(median(responseTimes))}</dd></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Solicitudes relevantes</dt><dd className="mt-2 text-3xl font-black text-ink">{relevantRequests}</dd><p className="mt-1 text-xs text-muted">{percentage(relevantRequests, ratedRequests.length)} de {ratedRequests.length} valoradas</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Activity size={16} aria-hidden />Actividad 7 / 30 / 90 días</dt><dd className="mt-2 text-2xl font-black text-ink">{activeWithin(7)} / {activeWithin(30)} / {activeWithin(90)}</dd><p className="mt-1 text-xs text-muted">Titulares con acción significativa</p></div>
        </dl>
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <SegmentTable title="Oferta por categoría" description="Cobertura y preparación actual de cada tipo de proveedor." rows={segmentRows(businesses, (profile) => profile.category)} />
        <SegmentTable title="Oferta por municipio" description="No equivale a cobertura confirmada; usa el municipio principal declarado." rows={segmentRows(businesses, (profile) => profile.municipality || "No indicado")} />
      </div>

      <p className="mt-6 rounded-2xl border border-line bg-soft p-4 text-sm leading-6 text-slatecopy">Este informe no afirma que una ficha esté activa solo por estar aprobada. La actividad requiere una acción reciente; la disponibilidad requiere que el proveedor acepte solicitudes; y la verificación sigue siendo una señal independiente.</p>
    </main>
  );
}
