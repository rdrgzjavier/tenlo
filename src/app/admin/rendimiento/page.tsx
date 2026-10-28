import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BarChart3, Clock3, Eye, Handshake, MousePointerClick, UsersRound } from "lucide-react";
import PrivateAreaUnavailable from "@/components/PrivateAreaUnavailable";
import ReportPeriodSelector, { resolveReportPeriod } from "@/components/ReportPeriodSelector";
import ReportSegmentFilters from "@/components/ReportSegmentFilters";
import { loadDirectorySnapshot } from "@/lib/directory-repository";
import { trustLevelLabel } from "@/lib/display-labels";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";
import { verticalIdForCategory, verticalLabel } from "@/lib/verticals";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rendimiento de fichas | Tenlo",
  robots: { index: false, follow: false }
};

type DirectoryEvent = {
  anonymous_session_id: string;
  event_name: string;
  entity_type: "center" | "provider" | "listing";
  entity_id: string;
  category_id: string | null;
  vertical_id: string | null;
  municipality: string | null;
  created_at: string;
};

type PerformanceRow = {
  key: string;
  title: string;
  href: string | null;
  category: string;
  vertical: string;
  municipality: string;
  trustLevel: string;
  lastReviewed: string;
  impressions: number;
  views: number;
  opens: number;
  contacts: number;
  requests: number;
  responses: number;
  responsesWithinSla: number;
  usefulConnections: number;
  saves: number;
  sessions: Set<string>;
};

type ConnectionRequestMetric = {
  id: string;
  target_id: string | null;
  category_id: string | null;
  municipality: string | null;
  status: string;
  first_response_at: string | null;
  alternative_summary: string | null;
  created_at: string;
};

type ConnectionFeedbackMetric = {
  request_id: string;
  useful: boolean;
  outcome: string;
  created_at: string;
};

type SearchCoverageMetric = {
  category_id: string | null;
  vertical_id: string | null;
  municipality: string | null;
  results_count: number;
};

type BusinessClaimMetric = {
  id: string;
  external_key: string | null;
  claim_status: string;
};

const claimStatusLabels: Record<string, string> = {
  unclaimed: "Sin reclamar",
  claim_pending: "Reclamación pendiente",
  managed: "Gestionada",
  suspended: "Suspendida"
};

const contactEvents = new Set(["contact_started", "contact_email_clicked", "contact_phone_clicked", "contact_web_clicked"]);

function percent(part: number, total: number) {
  return total ? `${((part / total) * 100).toFixed(1)} %` : "Sin dato";
}

function dateLabel(value: Date) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(value);
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function percentile(values: number[], target: number) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * target;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  if (lowerIndex === upperIndex) return sorted[lowerIndex];
  return sorted[lowerIndex] + (sorted[upperIndex] - sorted[lowerIndex]) * (position - lowerIndex);
}

function durationLabel(milliseconds: number | null) {
  if (milliseconds === null) return "Sin datos";
  const hours = milliseconds / 3_600_000;
  if (hours < 48) return `${hours.toFixed(hours < 10 ? 1 : 0)} h`;
  return `${(hours / 24).toFixed(1)} días`;
}

function reportingKey(entityType: DirectoryEvent["entity_type"], entityId: string) {
  if (entityType === "center") return `center:${entityId.replace(/^ficha-/, "")}`;
  return `resource:${entityId}`;
}

export default async function AdminDirectoryPerformancePage({ searchParams }: { searchParams: Promise<{ period?: string; category?: string; municipality?: string; trust?: string; plan?: string; claim?: string }> }) {
  if (!hasSupabaseServerConfig()) return <PrivateAreaUnavailable />;

  const { period: rawPeriod, category: rawCategory, municipality: rawMunicipality, trust: rawTrust, plan: rawPlan, claim: rawClaim } = await searchParams;
  const period = resolveReportPeriod(rawPeriod);

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=/admin/rendimiento");

  const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", authData.user.id).maybeSingle();
  if (profile?.role !== "tenlo_admin" || profile.status !== "approved") redirect("/area-personal");

  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - period);
  const monthStart = new Date();
  monthStart.setDate(monthStart.getDate() - 30);
  const [{ data, error }, directory, requestsResult, feedbackResult, searchEventsResult, businessClaimsResult] = await Promise.all([
    supabase
      .from("directory_events")
      .select("anonymous_session_id,event_name,entity_type,entity_id,category_id,vertical_id,municipality,created_at")
      .gte("created_at", periodStart.toISOString())
      .order("created_at", { ascending: false })
      .limit(5000),
    loadDirectorySnapshot(),
    supabase
      .from("connection_requests")
      .select("id,target_id,category_id,municipality,status,first_response_at,alternative_summary,created_at")
      .eq("is_test", false)
      .gte("created_at", periodStart.toISOString())
      .limit(5000),
    supabase
      .from("connection_feedback")
      .select("request_id,useful,outcome,created_at")
      .gte("created_at", periodStart.toISOString())
      .limit(5000),
    supabase
      .from("search_events")
      .select("category_id,vertical_id,municipality,results_count")
      .gte("created_at", periodStart.toISOString())
      .limit(5000),
    supabase
      .from("business_profiles")
      .select("id,external_key,claim_status")
      .eq("is_test", false)
      .eq("status", "approved")
      .limit(5000)
  ]);

  const businessClaims = (businessClaimsResult.data ?? []) as BusinessClaimMetric[];
  const claimStatusByKey = new Map(businessClaims.map((profile) => [`resource:${profile.external_key || profile.id}`, profile.claim_status]));
  const labels = new Map<string, { title: string; href: string; trustLevel: string; trustId: string; plan: string | null; claimStatus: string | null; lastReviewed: string }>();
  const providerPlans = new Map(directory.providers.map((provider) => [provider.id, provider.plan]));
  directory.centers.forEach((center) => {
    labels.set(`center:${center.id}`, { title: center.name, href: `/centros/${center.slug}`, trustLevel: trustLevelLabel(center.trustLevel), trustId: center.trustLevel, plan: null, claimStatus: null, lastReviewed: center.lastReviewed || "Sin dato" });
  });
  directory.providers.forEach((provider) => labels.set(`resource:${provider.id}`, { title: provider.businessName, href: `/servicios/${provider.id}`, trustLevel: trustLevelLabel(provider.trustLevel), trustId: provider.trustLevel, plan: provider.plan, claimStatus: claimStatusByKey.get(`resource:${provider.id}`) ?? null, lastReviewed: provider.lastReviewed || "Sin dato" }));
  directory.listings.forEach((listing) => {
    const href = listing.categoryId === "centros" ? `/centros/${listing.slug}` : `/servicios/${listing.id}`;
    const key = listing.categoryId === "centros" ? reportingKey("center", listing.id) : `resource:${listing.id}`;
    labels.set(key, { title: listing.title, href, trustLevel: trustLevelLabel(listing.trustLevel), trustId: listing.trustLevel, plan: providerPlans.get(listing.userId) ?? null, claimStatus: claimStatusByKey.get(key) ?? claimStatusByKey.get(`resource:${listing.userId}`) ?? null, lastReviewed: listing.lastReviewed || "Sin dato" });
  });

  const allEvents = (data ?? []) as DirectoryEvent[];
  const allRequests = (requestsResult.data ?? []) as ConnectionRequestMetric[];
  const allSearches = (searchEventsResult.data ?? []) as SearchCoverageMetric[];
  const categoryOptions = [...new Set([
    ...allEvents.flatMap((event) => event.category_id ? [event.category_id] : []),
    ...allRequests.flatMap((request) => request.category_id ? [request.category_id] : []),
    ...directory.listings.map((listing) => listing.categoryId)
  ])].sort((a, b) => a.localeCompare(b, "es"));
  const municipalityOptions = [...new Set([
    ...allEvents.flatMap((event) => event.municipality ? [event.municipality] : []),
    ...allRequests.flatMap((request) => request.municipality ? [request.municipality] : []),
    ...directory.listings.flatMap((listing) => listing.municipality ? [listing.municipality] : [])
  ])].sort((a, b) => a.localeCompare(b, "es"));
  const activeCategory = rawCategory && categoryOptions.includes(rawCategory) ? rawCategory : "";
  const activeMunicipality = rawMunicipality && municipalityOptions.includes(rawMunicipality) ? rawMunicipality : "";
  const trustOptions = ["collected", "managed", "verified", "official"].filter((trust) => directory.listings.some((listing) => listing.trustLevel === trust));
  const planOptions = ["gratuito", "destacado", "premium"].filter((plan) => directory.providers.some((provider) => provider.plan === plan));
  const activeTrust = rawTrust && trustOptions.includes(rawTrust) ? rawTrust : "";
  const activePlan = rawPlan && planOptions.includes(rawPlan) ? rawPlan : "";
  const claimOptions = [...new Set(businessClaims.map((profile) => profile.claim_status))].filter((status) => claimStatusLabels[status]).sort((a, b) => claimStatusLabels[a].localeCompare(claimStatusLabels[b], "es"));
  const activeClaim = rawClaim && claimOptions.includes(rawClaim) ? rawClaim : "";
  const matchesProfileFilters = (key: string) => {
    const metadata = labels.get(key);
    return (!activeTrust || metadata?.trustId === activeTrust) && (!activePlan || metadata?.plan === activePlan) && (!activeClaim || metadata?.claimStatus === activeClaim);
  };
  const events = allEvents.filter((event) => (
    (!activeCategory || event.category_id === activeCategory)
    && (!activeMunicipality || event.municipality === activeMunicipality)
    && matchesProfileFilters(reportingKey(event.entity_type, event.entity_id))
  ));
  const requests = allRequests.filter((request) => (
    (!activeCategory || request.category_id === activeCategory)
    && (!activeMunicipality || request.municipality === activeMunicipality)
    && ((!activeTrust && !activePlan && !activeClaim) || Boolean(request.target_id && matchesProfileFilters(labels.has(reportingKey("center", request.target_id)) ? reportingKey("center", request.target_id) : `resource:${request.target_id}`)))
  ));
  const requestIds = new Set(requests.map((request) => request.id));
  const feedback = ((feedbackResult.data ?? []) as ConnectionFeedbackMetric[]).filter((item) => requestIds.has(item.request_id));
  const searches = allSearches.filter((search) => (
    (!activeCategory || search.category_id === activeCategory)
    && (!activeMunicipality || search.municipality === activeMunicipality)
  ));
  const publishedListings = directory.listings.filter((listing) => (
    listing.status === "published"
    && (!activeCategory || listing.categoryId === activeCategory)
    && (!activeMunicipality || listing.municipality === activeMunicipality)
    && matchesProfileFilters(listing.categoryId === "centros" ? reportingKey("center", listing.id) : `resource:${listing.id}`)
  ));
  const grouped = new Map<string, PerformanceRow>();
  const rowFor = (key: string, category: string | null, municipality: string | null, vertical?: string | null) => {
    const label = labels.get(key);
    const row = grouped.get(key) ?? {
      key,
      title: label?.title ?? "Ficha sin título disponible",
      href: label?.href ?? null,
      category: category ?? "Sin categoría",
      vertical: vertical || verticalIdForCategory(category ?? undefined),
      municipality: municipality ?? "Sin municipio",
      trustLevel: label?.trustLevel ?? "Sin dato",
      lastReviewed: label?.lastReviewed ?? "Sin dato",
      impressions: 0,
      views: 0,
      opens: 0,
      contacts: 0,
      requests: 0,
      responses: 0,
      responsesWithinSla: 0,
      usefulConnections: 0,
      saves: 0,
      sessions: new Set<string>()
    };
    if (row.vertical === "unclassified" && vertical) row.vertical = vertical;
    grouped.set(key, row);
    return row;
  };
  for (const event of events) {
    const key = reportingKey(event.entity_type, event.entity_id);
    const row = rowFor(key, event.category_id, event.municipality, event.vertical_id);
    row.sessions.add(event.anonymous_session_id);
    if (event.event_name === "provider_impression") row.impressions += 1;
    if (["provider_profile_viewed", "center_profile_viewed"].includes(event.event_name)) row.views += 1;
    if (event.event_name === "result_opened") row.opens += 1;
    if (contactEvents.has(event.event_name)) row.contacts += 1;
    if (event.event_name === "provider_saved") row.saves += 1;
  }

  const requestRowKeys = new Map<string, string>();
  requests.forEach((request) => {
    if (!request.target_id) return;
    const centerKey = reportingKey("center", request.target_id);
    const resourceKey = `resource:${request.target_id}`;
    const key = labels.has(centerKey) ? centerKey : resourceKey;
    const row = rowFor(key, request.category_id, request.municipality, verticalIdForCategory(request.category_id ?? undefined));
    row.requests += 1;
    requestRowKeys.set(request.id, key);
    const responseAt = request.first_response_at ? new Date(request.first_response_at).getTime() : null;
    if (responseAt !== null || request.alternative_summary || ["responded", "declined", "alternative_offered", "closed"].includes(request.status)) row.responses += 1;
    if (responseAt !== null) {
      const responseTime = responseAt - new Date(request.created_at).getTime();
      if (responseTime >= 0 && responseTime <= 48 * 3_600_000) row.responsesWithinSla += 1;
    }
  });
  feedback.forEach((item) => {
    if (!item.useful) return;
    const key = requestRowKeys.get(item.request_id);
    if (key) grouped.get(key)!.usefulConnections += 1;
  });
  const rows = [...grouped.values()].sort((a, b) => b.views + b.opens - (a.views + a.opens) || b.impressions - a.impressions);
  const totalImpressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  const totalViews = rows.reduce((sum, row) => sum + row.views, 0);
  const totalContacts = rows.reduce((sum, row) => sum + row.contacts, 0);
  const totalSessions = new Set(events.map((event) => event.anonymous_session_id)).size;
  const verticalPerformance = rows.reduce((groups, row) => {
    const current = groups.get(row.vertical) ?? {
      id: row.vertical,
      profilesWithSignal: 0,
      publishedProfiles: 0,
      activeProfiles: 0,
      searches: 0,
      coveredSearches: 0,
      impressions: 0,
      views: 0,
      contacts: 0,
      requests: 0,
      responses: 0,
      usefulConnections: 0
    };
    current.profilesWithSignal += 1;
    current.impressions += row.impressions;
    current.views += row.views;
    current.contacts += row.contacts;
    current.requests += row.requests;
    current.responses += row.responses;
    current.usefulConnections += row.usefulConnections;
    groups.set(row.vertical, current);
    return groups;
  }, new Map<string, { id: string; profilesWithSignal: number; publishedProfiles: number; activeProfiles: number; searches: number; coveredSearches: number; impressions: number; views: number; contacts: number; requests: number; responses: number; usefulConnections: number }>());
  const verticalRow = (vertical: string) => {
    const current = verticalPerformance.get(vertical) ?? {
      id: vertical,
      profilesWithSignal: 0,
      publishedProfiles: 0,
      activeProfiles: 0,
      searches: 0,
      coveredSearches: 0,
      impressions: 0,
      views: 0,
      contacts: 0,
      requests: 0,
      responses: 0,
      usefulConnections: 0
    };
    verticalPerformance.set(vertical, current);
    return current;
  };
  publishedListings.forEach((listing) => {
    const row = verticalRow(verticalIdForCategory(listing.categoryId));
    row.publishedProfiles += 1;
    if (listing.acceptsRequests) row.activeProfiles += 1;
  });
  searches.forEach((search) => {
    const row = verticalRow(search.vertical_id || verticalIdForCategory(search.category_id ?? undefined));
    row.searches += 1;
    if (search.results_count > 0) row.coveredSearches += 1;
  });
  const verticalRows = [...verticalPerformance.values()]
    .sort((a, b) => verticalLabel(a.id).localeCompare(verticalLabel(b.id), "es"));
  const respondedRequests = requests.filter((request) => request.first_response_at || request.alternative_summary).length;
  const responseTimes = requests.flatMap((request) => request.first_response_at
    ? [new Date(request.first_response_at).getTime() - new Date(request.created_at).getTime()]
    : []
  ).filter((duration) => duration >= 0);
  const responsePercentiles = responseTimes.length >= 10
    ? { p75: percentile(responseTimes, 0.75), p90: percentile(responseTimes, 0.9) }
    : null;
  const confirmedOutcomes = feedback.filter((item) => item.outcome !== "not_progressed").length;
  const usefulConnectionsPeriod = feedback.filter((item) => item.useful).length;
  const usefulConnections30 = feedback.filter((item) => item.useful && new Date(item.created_at) >= monthStart).length;
  const operationalError = requestsResult.error || feedbackResult.error || searchEventsResult.error || businessClaimsResult.error;

  return (
    <main className="section-shell">
      <Link href="/admin" className="inline-flex min-h-11 items-center gap-2 font-bold text-ink underline"><ArrowLeft size={18} aria-hidden />Volver a operación</Link>
      <p className="label mt-6">Informe interno</p>
      <h1 className="page-title">Rendimiento de fichas</h1>
      <p className="lead max-w-4xl">Visibilidad e intención registrada con consentimiento estadístico. Periodo del {dateLabel(periodStart)} al {dateLabel(new Date())}.</p>
      <ReportPeriodSelector activePeriod={period} pathname="/admin/rendimiento" preservedParams={{ category: activeCategory, municipality: activeMunicipality, trust: activeTrust, plan: activePlan, claim: activeClaim }} />
      <ReportSegmentFilters
        activeCategory={activeCategory}
        activeMunicipality={activeMunicipality}
        activePeriod={period}
        categoryOptions={categoryOptions}
        municipalityOptions={municipalityOptions}
        pathname="/admin/rendimiento"
        extraFilters={[
          { name: "trust", label: "Confianza", activeValue: activeTrust, allLabel: "Todos los niveles", options: trustOptions.map((trust) => ({ value: trust, label: trustLevelLabel(trust as "collected" | "managed" | "verified" | "official") })) },
          { name: "plan", label: "Plan", activeValue: activePlan, allLabel: "Todos los planes", options: planOptions.map((plan) => ({ value: plan, label: plan === "gratuito" ? "Gratuito" : plan === "destacado" ? "Destacado" : "Premium" })) },
          { name: "claim", label: "Reclamación", activeValue: activeClaim, allLabel: "Todos los estados", options: claimOptions.map((status) => ({ value: status, label: claimStatusLabels[status] })) }
        ]}
      />

      {error ? <p className="mt-6 rounded-2xl border border-coral/30 bg-coral/10 p-4 text-sm font-semibold text-coral">Todavía no se puede consultar el histórico por ficha. Comprueba que la migración de rendimiento esté aplicada.</p> : null}
      {operationalError ? <p className="mt-3 rounded-2xl border border-coral/30 bg-coral/10 p-4 text-sm font-semibold text-coral">No se ha podido cargar una parte del embudo de conexiones. Comprueba los permisos administrativos.</p> : null}

      <section className="card mt-6 p-5 md:p-6" aria-labelledby="performance-summary-title">
        <div className="flex items-center gap-3"><BarChart3 size={22} className="text-ink" aria-hidden /><div><h2 id="performance-summary-title" className="subsection-title text-ink">Resumen de {period} días</h2><p className="mt-1 text-sm text-muted">No contiene nombres, emails, teléfonos, mensajes ni identificadores de cuenta.{activeCategory || activeMunicipality || activeTrust || activePlan || activeClaim ? " Visibilidad y detalle filtrados por el segmento seleccionado." : ""}</p></div></div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Eye size={16} aria-hidden />Impresiones</dt><dd className="mt-2 text-3xl font-black text-ink">{events.length ? totalImpressions : "Sin datos"}</dd></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><MousePointerClick size={16} aria-hidden />Visitas de ficha</dt><dd className="mt-2 text-3xl font-black text-ink">{events.length ? totalViews : "Sin datos"}</dd></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Intenciones de contacto</dt><dd className="mt-2 text-3xl font-black text-ink">{events.length ? totalContacts : "Sin datos"}</dd></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><UsersRound size={16} aria-hidden />Sesiones observadas</dt><dd className="mt-2 text-3xl font-black text-ink">{events.length ? totalSessions : "Sin datos"}</dd></div>
        </dl>
      </section>

      <section className="card mt-6 p-5 md:p-6" aria-labelledby="connection-summary-title">
        <div className="flex items-center gap-3"><Handshake size={22} className="text-ink" aria-hidden /><div><h2 id="connection-summary-title" className="subsection-title text-ink">Conexiones y resultados</h2><p className="mt-1 text-sm text-muted">Solicitudes y feedback del segmento seleccionado. La North Star usa 30 días; el resto del embudo, {period} días.</p></div></div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Solicitudes creadas</dt><dd className="mt-2 text-3xl font-black text-ink">{requests.length || "Sin datos"}</dd><p className="mt-1 text-xs text-muted">Últimos {period} días</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Con respuesta o alternativa</dt><dd className="mt-2 text-3xl font-black text-ink">{requests.length ? respondedRequests : "Sin datos"}</dd><p className="mt-1 text-xs text-muted">{requests.length ? `${percent(respondedRequests, requests.length)} de las solicitudes` : "Sin tasa calculable"}</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Clock3 size={16} aria-hidden />Tiempo de respuesta</dt><dd className="mt-2 text-3xl font-black text-ink">{durationLabel(median(responseTimes))}</dd><p className="mt-1 text-xs text-muted">Mediana · {responseTimes.length} primeras respuestas</p>{responsePercentiles ? <p className="mt-2 text-xs font-semibold text-slatecopy">P75 {durationLabel(responsePercentiles.p75)} · P90 {durationLabel(responsePercentiles.p90)}</p> : <p className="mt-2 text-xs text-muted">P75 y P90 se mostrarán desde 10 respuestas.</p>}</div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Resultados confirmados</dt><dd className="mt-2 text-3xl font-black text-ink">{feedback.length ? confirmedOutcomes : "Sin datos"}</dd><p className="mt-1 text-xs text-muted">{feedback.length ? `${percent(confirmedOutcomes, feedback.length)} del feedback recibido` : "Últimos 90 días"}</p></div>
          <div className="rounded-2xl border border-violet/25 bg-violet/5 p-4"><dt className="text-sm font-semibold text-muted">Conexiones útiles mensuales</dt><dd className="mt-2 text-3xl font-black text-ink">{usefulConnections30}</dd><p className="mt-1 text-xs text-muted">North Star · {usefulConnectionsPeriod} útiles en {period} días</p></div>
        </dl>
        <p className="mt-4 text-xs leading-5 text-muted">Una respuesta o alternativa no se considera útil por sí sola: la conexión útil requiere valoración de la familia. No se muestran rankings ni comparaciones si la muestra es insuficiente.</p>
      </section>

      <section className="card mt-6 p-5 md:p-6" aria-labelledby="vertical-performance-title">
        <h2 id="vertical-performance-title" className="subsection-title text-ink">Rendimiento por vertical</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Lectura operativa por tipo de necesidad. Los volúmenes no forman un ranking: cada vertical tiene una frecuencia natural distinta. Cobertura significa búsqueda con al menos un resultado; disponibilidad significa ficha que confirma aceptar solicitudes. Los filtros de confianza y plan acotan la oferta y su rendimiento, no la demanda observada. Las tasas se ocultan con menos de tres búsquedas, 20 visitas o cinco solicitudes.</p>
        {verticalRows.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[82rem] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <tr><th className="pb-3 pr-4">Vertical</th><th className="pb-3 pr-4 text-right">Fichas publicadas</th><th className="pb-3 pr-4 text-right">Disponibles</th><th className="pb-3 pr-4 text-right">Búsquedas</th><th className="pb-3 pr-4 text-right">Cobertura</th><th className="pb-3 pr-4 text-right">Impresiones</th><th className="pb-3 pr-4 text-right">Visitas</th><th className="pb-3 pr-4 text-right">Contactos</th><th className="pb-3 pr-4 text-right">Contacto / visita</th><th className="pb-3 pr-4 text-right">Solicitudes</th><th className="pb-3 pr-4 text-right">Respuestas</th><th className="pb-3 text-right">Conexiones útiles</th></tr>
              </thead>
              <tbody>
                {verticalRows.map((row) => (
                  <tr key={row.id} className="border-b border-line last:border-0">
                    <th scope="row" className="py-3 pr-4 font-semibold text-ink">{verticalLabel(row.id)}</th>
                    <td className="py-3 pr-4 text-right text-slatecopy">{row.publishedProfiles}</td>
                    <td className="py-3 pr-4 text-right text-slatecopy">{row.activeProfiles}</td>
                    <td className="py-3 pr-4 text-right text-slatecopy">{row.searches}</td>
                    <td className="py-3 pr-4 text-right text-slatecopy">{row.searches < 3 ? "—" : percent(row.coveredSearches, row.searches)}</td>
                    <td className="py-3 pr-4 text-right text-slatecopy">{row.impressions}</td>
                    <td className="py-3 pr-4 text-right text-slatecopy">{row.views}</td>
                    <td className="py-3 pr-4 text-right text-slatecopy">{row.contacts}</td>
                    <td className="py-3 pr-4 text-right text-slatecopy">{row.views < 20 ? "—" : percent(row.contacts, row.views)}</td>
                    <td className="py-3 pr-4 text-right text-slatecopy">{row.requests}</td>
                    <td className="py-3 pr-4 text-right text-slatecopy">{row.requests < 5 ? "—" : `${row.responses} · ${percent(row.responses, row.requests)}`}</td>
                    <td className="py-3 text-right text-slatecopy">{row.usefulConnections}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="mt-5 rounded-2xl border border-line bg-soft p-4 text-sm text-muted">Todavía no hay señales suficientes para comparar verticales.</p>}
      </section>

      <section className="card mt-6 p-5 md:p-6">
        <h2 className="subsection-title text-ink">Detalle por ficha</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Las tasas se muestran como orientación operativa. Con menos de 20 impresiones la muestra se marca como insuficiente; las tasas de solicitud y SLA se ocultan con menos de cinco oportunidades. Solicitudes, respuestas y utilidad proceden del backend y no dependen del consentimiento analítico.</p>
        {rows.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[108rem] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <tr><th className="pb-3 pr-4">Ficha</th><th className="pb-3 pr-4">Confianza</th><th className="pb-3 pr-4">Última revisión</th><th className="pb-3 pr-4 text-right">Sesiones</th><th className="pb-3 pr-4 text-right">Impresiones</th><th className="pb-3 pr-4 text-right">Aperturas</th><th className="pb-3 pr-4 text-right">Visitas</th><th className="pb-3 pr-4 text-right">CTR</th><th className="pb-3 pr-4 text-right">Contactos</th><th className="pb-3 pr-4 text-right">Contacto / visita</th><th className="pb-3 pr-4 text-right">Solicitudes</th><th className="pb-3 pr-4 text-right">Solicitud / contacto</th><th className="pb-3 pr-4 text-right">Respuestas</th><th className="pb-3 pr-4 text-right">≤ 48 h</th><th className="pb-3 pr-4 text-right">Útiles</th><th className="pb-3 text-right">Guardados</th></tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const lowSample = row.impressions < 20;
                  return (
                    <tr key={row.key} className="border-b border-line align-top last:border-0">
                      <th scope="row" className="py-4 pr-4"><div className="font-semibold text-ink">{row.href ? <Link href={row.href} target="_blank" className="underline">{row.title}</Link> : row.title}</div><div className="mt-1 text-xs font-normal text-muted">{row.category} · {row.municipality}</div>{lowSample ? <span className="mt-2 inline-flex rounded-full bg-soft px-2 py-1 text-[11px] font-bold text-muted">Muestra insuficiente</span> : null}</th>
                      <td className="py-4 pr-4 text-slatecopy">{row.trustLevel}</td>
                      <td className="py-4 pr-4 text-slatecopy">{row.lastReviewed}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.sessions.size}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.impressions}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.opens}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.views}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{lowSample ? "—" : percent(row.opens, row.impressions)}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.contacts}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.views < 20 ? "—" : percent(row.contacts, row.views)}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.requests}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.contacts < 5 ? "—" : percent(row.requests, row.contacts)}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.responses}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.requests < 5 ? "—" : percent(row.responsesWithinSla, row.requests)}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.usefulConnections}</td>
                      <td className="py-4 text-right text-slatecopy">{row.saves}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <p className="mt-5 rounded-2xl border border-line bg-soft p-4 text-sm text-muted">Todavía no hay eventos consentidos suficientes. El histórico empezará a construirse tras desplegar esta medición.</p>}
      </section>
    </main>
  );
}
