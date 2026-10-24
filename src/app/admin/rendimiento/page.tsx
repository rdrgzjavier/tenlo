import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BarChart3, Clock3, Eye, Handshake, MousePointerClick, UsersRound } from "lucide-react";
import PrivateAreaUnavailable from "@/components/PrivateAreaUnavailable";
import ReportPeriodSelector, { resolveReportPeriod } from "@/components/ReportPeriodSelector";
import ReportSegmentFilters from "@/components/ReportSegmentFilters";
import { loadDirectorySnapshot } from "@/lib/directory-repository";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

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
  municipality: string | null;
  created_at: string;
};

type PerformanceRow = {
  key: string;
  title: string;
  href: string | null;
  category: string;
  municipality: string;
  impressions: number;
  views: number;
  opens: number;
  contacts: number;
  requests: number;
  saves: number;
  sessions: Set<string>;
};

type ConnectionRequestMetric = {
  status: string;
  first_response_at: string | null;
  alternative_summary: string | null;
  created_at: string;
};

type ConnectionFeedbackMetric = {
  useful: boolean;
  outcome: string;
  created_at: string;
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

export default async function AdminDirectoryPerformancePage({ searchParams }: { searchParams: Promise<{ period?: string; category?: string; municipality?: string }> }) {
  if (!hasSupabaseServerConfig()) return <PrivateAreaUnavailable />;

  const { period: rawPeriod, category: rawCategory, municipality: rawMunicipality } = await searchParams;
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
  const [{ data, error }, directory, requestsResult, feedbackResult] = await Promise.all([
    supabase
      .from("directory_events")
      .select("anonymous_session_id,event_name,entity_type,entity_id,category_id,municipality,created_at")
      .gte("created_at", periodStart.toISOString())
      .order("created_at", { ascending: false })
      .limit(5000),
    loadDirectorySnapshot(),
    supabase
      .from("connection_requests")
      .select("status,first_response_at,alternative_summary,created_at")
      .gte("created_at", periodStart.toISOString())
      .limit(5000),
    supabase
      .from("connection_feedback")
      .select("useful,outcome,created_at")
      .gte("created_at", periodStart.toISOString())
      .limit(5000)
  ]);

  const labels = new Map<string, { title: string; href: string }>();
  directory.centers.forEach((center) => {
    labels.set(`center:${center.id}`, { title: center.name, href: `/centros/${center.slug}` });
  });
  directory.providers.forEach((provider) => labels.set(`resource:${provider.id}`, { title: provider.businessName, href: `/servicios/${provider.id}` }));
  directory.listings.forEach((listing) => {
    const href = listing.categoryId === "centros" ? `/centros/${listing.slug}` : `/servicios/${listing.id}`;
    labels.set(listing.categoryId === "centros" ? reportingKey("center", listing.id) : `resource:${listing.id}`, { title: listing.title, href });
  });

  const allEvents = (data ?? []) as DirectoryEvent[];
  const categoryOptions = [...new Set(allEvents.flatMap((event) => event.category_id ? [event.category_id] : []))].sort((a, b) => a.localeCompare(b, "es"));
  const municipalityOptions = [...new Set(allEvents.flatMap((event) => event.municipality ? [event.municipality] : []))].sort((a, b) => a.localeCompare(b, "es"));
  const activeCategory = rawCategory && categoryOptions.includes(rawCategory) ? rawCategory : "";
  const activeMunicipality = rawMunicipality && municipalityOptions.includes(rawMunicipality) ? rawMunicipality : "";
  const events = allEvents.filter((event) => (
    (!activeCategory || event.category_id === activeCategory)
    && (!activeMunicipality || event.municipality === activeMunicipality)
  ));
  const grouped = new Map<string, PerformanceRow>();
  for (const event of events) {
    const key = reportingKey(event.entity_type, event.entity_id);
    const label = labels.get(key);
    const row = grouped.get(key) ?? {
      key,
      title: label?.title ?? "Ficha sin título disponible",
      href: label?.href ?? null,
      category: event.category_id ?? "Sin categoría",
      municipality: event.municipality ?? "Sin municipio",
      impressions: 0,
      views: 0,
      opens: 0,
      contacts: 0,
      requests: 0,
      saves: 0,
      sessions: new Set<string>()
    };
    row.sessions.add(event.anonymous_session_id);
    if (event.event_name === "provider_impression") row.impressions += 1;
    if (["provider_profile_viewed", "center_profile_viewed"].includes(event.event_name)) row.views += 1;
    if (event.event_name === "result_opened") row.opens += 1;
    if (contactEvents.has(event.event_name)) row.contacts += 1;
    if (event.event_name === "request_created") row.requests += 1;
    if (event.event_name === "provider_saved") row.saves += 1;
    grouped.set(key, row);
  }

  const rows = [...grouped.values()].sort((a, b) => b.views + b.opens - (a.views + a.opens) || b.impressions - a.impressions);
  const totalImpressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  const totalViews = rows.reduce((sum, row) => sum + row.views, 0);
  const totalContacts = rows.reduce((sum, row) => sum + row.contacts, 0);
  const totalSessions = new Set(events.map((event) => event.anonymous_session_id)).size;
  const requests = (requestsResult.data ?? []) as ConnectionRequestMetric[];
  const feedback = (feedbackResult.data ?? []) as ConnectionFeedbackMetric[];
  const respondedRequests = requests.filter((request) => request.first_response_at || request.alternative_summary).length;
  const responseTimes = requests.flatMap((request) => request.first_response_at
    ? [new Date(request.first_response_at).getTime() - new Date(request.created_at).getTime()]
    : []
  ).filter((duration) => duration >= 0);
  const confirmedOutcomes = feedback.filter((item) => item.outcome !== "not_progressed").length;
  const usefulConnectionsPeriod = feedback.filter((item) => item.useful).length;
  const usefulConnections30 = feedback.filter((item) => item.useful && new Date(item.created_at) >= monthStart).length;
  const operationalError = requestsResult.error || feedbackResult.error;

  return (
    <main className="section-shell">
      <Link href="/admin" className="inline-flex min-h-11 items-center gap-2 font-bold text-ink underline"><ArrowLeft size={18} aria-hidden />Volver a operación</Link>
      <p className="label mt-6">Informe interno</p>
      <h1 className="page-title">Rendimiento de fichas</h1>
      <p className="lead max-w-4xl">Visibilidad e intención registrada con consentimiento estadístico. Periodo del {dateLabel(periodStart)} al {dateLabel(new Date())}.</p>
      <ReportPeriodSelector activePeriod={period} pathname="/admin/rendimiento" preservedParams={{ category: activeCategory, municipality: activeMunicipality }} />
      <ReportSegmentFilters activeCategory={activeCategory} activeMunicipality={activeMunicipality} activePeriod={period} categoryOptions={categoryOptions} municipalityOptions={municipalityOptions} pathname="/admin/rendimiento" />

      {error ? <p className="mt-6 rounded-2xl border border-coral/30 bg-coral/10 p-4 text-sm font-semibold text-coral">Todavía no se puede consultar el histórico por ficha. Comprueba que la migración de rendimiento esté aplicada.</p> : null}
      {operationalError ? <p className="mt-3 rounded-2xl border border-coral/30 bg-coral/10 p-4 text-sm font-semibold text-coral">No se ha podido cargar una parte del embudo de conexiones. Comprueba los permisos administrativos.</p> : null}

      <section className="card mt-6 p-5 md:p-6" aria-labelledby="performance-summary-title">
        <div className="flex items-center gap-3"><BarChart3 size={22} className="text-ink" aria-hidden /><div><h2 id="performance-summary-title" className="subsection-title text-ink">Resumen de {period} días</h2><p className="mt-1 text-sm text-muted">No contiene nombres, emails, teléfonos, mensajes ni identificadores de cuenta.{activeCategory || activeMunicipality ? " Visibilidad y detalle filtrados por el segmento seleccionado." : ""}</p></div></div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Eye size={16} aria-hidden />Impresiones</dt><dd className="mt-2 text-3xl font-black text-ink">{events.length ? totalImpressions : "Sin datos"}</dd></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><MousePointerClick size={16} aria-hidden />Visitas de ficha</dt><dd className="mt-2 text-3xl font-black text-ink">{events.length ? totalViews : "Sin datos"}</dd></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Intenciones de contacto</dt><dd className="mt-2 text-3xl font-black text-ink">{events.length ? totalContacts : "Sin datos"}</dd></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><UsersRound size={16} aria-hidden />Sesiones observadas</dt><dd className="mt-2 text-3xl font-black text-ink">{events.length ? totalSessions : "Sin datos"}</dd></div>
        </dl>
      </section>

      <section className="card mt-6 p-5 md:p-6" aria-labelledby="connection-summary-title">
        <div className="flex items-center gap-3"><Handshake size={22} className="text-ink" aria-hidden /><div><h2 id="connection-summary-title" className="subsection-title text-ink">Conexiones y resultados</h2><p className="mt-1 text-sm text-muted">Solicitudes y feedback agregado del conjunto del piloto, sin aplicar los filtros de ficha. La North Star usa 30 días; el resto del embudo, {period} días.</p></div></div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Solicitudes creadas</dt><dd className="mt-2 text-3xl font-black text-ink">{requests.length || "Sin datos"}</dd><p className="mt-1 text-xs text-muted">Últimos {period} días</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Con respuesta o alternativa</dt><dd className="mt-2 text-3xl font-black text-ink">{requests.length ? respondedRequests : "Sin datos"}</dd><p className="mt-1 text-xs text-muted">{requests.length ? `${percent(respondedRequests, requests.length)} de las solicitudes` : "Sin tasa calculable"}</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Clock3 size={16} aria-hidden />Tiempo mediano de respuesta</dt><dd className="mt-2 text-3xl font-black text-ink">{durationLabel(median(responseTimes))}</dd><p className="mt-1 text-xs text-muted">Solo primeras respuestas registradas</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Resultados confirmados</dt><dd className="mt-2 text-3xl font-black text-ink">{feedback.length ? confirmedOutcomes : "Sin datos"}</dd><p className="mt-1 text-xs text-muted">{feedback.length ? `${percent(confirmedOutcomes, feedback.length)} del feedback recibido` : "Últimos 90 días"}</p></div>
          <div className="rounded-2xl border border-violet/25 bg-violet/5 p-4"><dt className="text-sm font-semibold text-muted">Conexiones útiles mensuales</dt><dd className="mt-2 text-3xl font-black text-ink">{usefulConnections30}</dd><p className="mt-1 text-xs text-muted">North Star · {usefulConnectionsPeriod} útiles en {period} días</p></div>
        </dl>
        <p className="mt-4 text-xs leading-5 text-muted">Una respuesta o alternativa no se considera útil por sí sola: la conexión útil requiere valoración de la familia. No se muestran rankings ni comparaciones si la muestra es insuficiente.</p>
      </section>

      <section className="card mt-6 p-5 md:p-6">
        <h2 className="subsection-title text-ink">Detalle por ficha</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Las tasas se muestran como orientación operativa. Con menos de 20 impresiones la muestra se marca como insuficiente y no debe usarse para comparar proveedores.</p>
        {rows.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[74rem] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <tr><th className="pb-3 pr-4">Ficha</th><th className="pb-3 pr-4 text-right">Sesiones</th><th className="pb-3 pr-4 text-right">Impresiones</th><th className="pb-3 pr-4 text-right">Aperturas</th><th className="pb-3 pr-4 text-right">Visitas</th><th className="pb-3 pr-4 text-right">CTR</th><th className="pb-3 pr-4 text-right">Contactos</th><th className="pb-3 pr-4 text-right">Contacto / visita</th><th className="pb-3 pr-4 text-right">Solicitudes</th><th className="pb-3 text-right">Guardados</th></tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const lowSample = row.impressions < 20;
                  return (
                    <tr key={row.key} className="border-b border-line align-top last:border-0">
                      <th scope="row" className="py-4 pr-4"><div className="font-semibold text-ink">{row.href ? <Link href={row.href} target="_blank" className="underline">{row.title}</Link> : row.title}</div><div className="mt-1 text-xs font-normal text-muted">{row.category} · {row.municipality}</div>{lowSample ? <span className="mt-2 inline-flex rounded-full bg-soft px-2 py-1 text-[11px] font-bold text-muted">Muestra insuficiente</span> : null}</th>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.sessions.size}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.impressions}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.opens}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.views}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{lowSample ? "—" : percent(row.opens, row.impressions)}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.contacts}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.views < 20 ? "—" : percent(row.contacts, row.views)}</td>
                      <td className="py-4 pr-4 text-right text-slatecopy">{row.requests}</td>
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
