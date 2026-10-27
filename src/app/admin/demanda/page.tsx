import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BarChart3, CheckCircle2, Eye, MapPin, MessageCircle, SearchX, Send, Sparkles, TrendingUp } from "lucide-react";
import PrivateAreaUnavailable from "@/components/PrivateAreaUnavailable";
import ReportPeriodSelector, { resolveReportPeriod } from "@/components/ReportPeriodSelector";
import ReportSegmentFilters from "@/components/ReportSegmentFilters";
import { classifySearchIntent, searchIntentLabel } from "@/lib/search-intent";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Demanda del piloto | Tenlo",
  robots: { index: false, follow: false }
};

type SearchEvent = {
  search_id: string | null;
  normalized_query: string | null;
  category_id: string | null;
  vertical_id: string | null;
  municipality: string | null;
  results_count: number;
  zero_results: boolean;
  created_at: string;
};

type SearchJourneyEvent = {
  event_id: string;
  search_id: string | null;
  event_name: string;
  created_at: string;
};

type ConnectionRequest = {
  id: string;
  event_id: string;
  status: string;
  first_response_at: string | null;
};

type ConnectionFeedback = {
  request_id: string;
  useful: boolean;
};

type RankedValue = {
  label: string;
  searches: number;
  zeroResults: number;
  averageResults: number;
};

type TrendValue = {
  label: string;
  current: number;
  previous: number;
  change: number;
};

type OutcomeValue = {
  id: string;
  label: string;
  searches: number;
  zeroResults: number;
  requests: number;
  feedback: number;
  useful: number;
};

function dateLabel(value: Date) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(value);
}

function percent(part: number, total: number) {
  return total ? `${Math.round((part / total) * 100)} %` : "Sin datos";
}

function firstEventAt(events: SearchJourneyEvent[], names: Set<string>) {
  const timestamps = new Map<string, number>();
  events.forEach((event) => {
    if (!event.search_id || !names.has(event.event_name)) return;
    const occurredAt = new Date(event.created_at).getTime();
    const current = timestamps.get(event.search_id);
    if (current === undefined || occurredAt < current) timestamps.set(event.search_id, occurredAt);
  });
  return timestamps;
}

function rankBy(events: SearchEvent[], selector: (event: SearchEvent) => string | null, limit = 8) {
  const grouped = new Map<string, { searches: number; zeroResults: number; resultSum: number }>();

  for (const event of events) {
    const rawLabel = selector(event)?.trim();
    if (!rawLabel) continue;
    const current = grouped.get(rawLabel) ?? { searches: 0, zeroResults: 0, resultSum: 0 };
    current.searches += 1;
    current.zeroResults += event.zero_results ? 1 : 0;
    current.resultSum += event.results_count;
    grouped.set(rawLabel, current);
  }

  return [...grouped.entries()]
    .map(([label, value]): RankedValue => ({
      label,
      searches: value.searches,
      zeroResults: value.zeroResults,
      averageResults: value.searches ? value.resultSum / value.searches : 0
    }))
    .sort((a, b) => b.searches - a.searches || b.zeroResults - a.zeroResults || a.label.localeCompare(b.label, "es"))
    .slice(0, limit);
}

function opportunityRank(events: SearchEvent[], limit = 12) {
  return rankBy(events, (event) => event.normalized_query, 100)
    .filter((item) => item.searches >= 3 && item.zeroResults > 0)
    .sort((a, b) => b.zeroResults - a.zeroResults || b.searches - a.searches || a.averageResults - b.averageResults)
    .slice(0, limit);
}

function emergingTrends(currentEvents: SearchEvent[], previousEvents: SearchEvent[], limit = 8) {
  const countTerms = (items: SearchEvent[]) => {
    const counts = new Map<string, number>();
    items.forEach((event) => {
      const term = event.normalized_query?.trim();
      if (term) counts.set(term, (counts.get(term) ?? 0) + 1);
    });
    return counts;
  };
  const currentCounts = countTerms(currentEvents);
  const previousCounts = countTerms(previousEvents);

  return [...currentCounts.entries()]
    .map(([label, current]): TrendValue => ({ label, current, previous: previousCounts.get(label) ?? 0, change: current - (previousCounts.get(label) ?? 0) }))
    .filter((item) => item.current >= 3 && item.change > 0)
    .sort((a, b) => b.change - a.change || b.current - a.current || a.label.localeCompare(b.label, "es"))
    .slice(0, limit);
}

function RankingTable({ title, description, items }: { title: string; description: string; items: RankedValue[] }) {
  return (
    <section className="card min-w-0 p-5 md:p-6">
      <h2 className="subsection-title text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      {items.length ? (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr><th className="pb-3 pr-4">Valor</th><th className="pb-3 pr-4 text-right">Búsquedas</th><th className="pb-3 pr-4 text-right">Sin resultados</th><th className="pb-3 text-right">Resultados medios</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.label} className="border-b border-line last:border-0">
                  <th scope="row" className="py-3 pr-4 font-semibold text-ink">{item.label}</th>
                  <td className="py-3 pr-4 text-right text-slatecopy">{item.searches}</td>
                  <td className="py-3 pr-4 text-right text-slatecopy">{item.zeroResults} ({percent(item.zeroResults, item.searches)})</td>
                  <td className="py-3 text-right text-slatecopy">{item.averageResults.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="mt-5 rounded-2xl border border-line bg-soft p-4 text-sm text-muted">Todavía no hay datos suficientes para este desglose.</p>}
    </section>
  );
}

function outcomeRows(
  events: SearchEvent[],
  selector: (event: SearchEvent) => { id: string; label: string } | null,
  requestedSearchIds: Set<string>,
  feedbackSearchIds: Set<string>,
  usefulSearchIds: Set<string>
) {
  const grouped = new Map<string, OutcomeValue>();

  events.forEach((event) => {
    const selected = selector(event);
    if (!selected) return;
    const current = grouped.get(selected.id) ?? {
      ...selected,
      searches: 0,
      zeroResults: 0,
      requests: 0,
      feedback: 0,
      useful: 0
    };
    current.searches += 1;
    current.zeroResults += event.zero_results ? 1 : 0;
    if (event.search_id && requestedSearchIds.has(event.search_id)) current.requests += 1;
    if (event.search_id && feedbackSearchIds.has(event.search_id)) current.feedback += 1;
    if (event.search_id && usefulSearchIds.has(event.search_id)) current.useful += 1;
    grouped.set(selected.id, current);
  });

  return [...grouped.values()];
}

function OutcomeTable({ title, description, items, emptyMessage, firstColumnLabel }: { title: string; description: string; items: OutcomeValue[]; emptyMessage: string; firstColumnLabel: string }) {
  return (
    <section className="card p-5 md:p-6">
      <h2 className="subsection-title text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      {items.length ? (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr><th className="pb-3 pr-4">{firstColumnLabel}</th><th className="pb-3 pr-4 text-right">Búsquedas</th><th className="pb-3 pr-4 text-right">Sin resultados</th><th className="pb-3 pr-4 text-right">Solicitudes</th><th className="pb-3 text-right">Conexión útil</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-line last:border-0">
                  <th scope="row" className="py-3 pr-4 font-semibold text-ink">{item.label}</th>
                  <td className="py-3 pr-4 text-right text-slatecopy">{item.searches}</td>
                  <td className="py-3 pr-4 text-right text-slatecopy">{item.zeroResults} ({percent(item.zeroResults, item.searches)})</td>
                  <td className="py-3 pr-4 text-right text-slatecopy">{item.requests}</td>
                  <td className="py-3 text-right text-slatecopy">{item.feedback ? `${item.useful} · ${percent(item.useful, item.feedback)}` : "Sin feedback"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="mt-5 rounded-2xl border border-line bg-soft p-4 text-sm text-muted">{emptyMessage}</p>}
    </section>
  );
}

export default async function AdminDemandPage({ searchParams }: { searchParams: Promise<{ period?: string; category?: string; municipality?: string }> }) {
  if (!hasSupabaseServerConfig()) return <PrivateAreaUnavailable />;

  const { period: rawPeriod, category: rawCategory, municipality: rawMunicipality } = await searchParams;
  const period = resolveReportPeriod(rawPeriod);

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=/admin/demanda");

  const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", authData.user.id).maybeSingle();
  if (profile?.role !== "tenlo_admin" || profile.status !== "approved") redirect("/area-personal");

  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - period);
  const comparisonStart = new Date();
  comparisonStart.setDate(comparisonStart.getDate() - period * 2);
  const [searchResult, journeyResult, connectionResult, feedbackResult] = await Promise.all([
    supabase
      .from("search_events")
      .select("search_id,normalized_query,category_id,vertical_id,municipality,results_count,zero_results,created_at")
      .gte("created_at", comparisonStart.toISOString())
      .order("created_at", { ascending: false })
      .limit(10000),
    supabase
      .from("directory_events")
      .select("event_id,search_id,event_name,created_at")
      .not("search_id", "is", null)
      .gte("created_at", periodStart.toISOString())
      .limit(10000),
    supabase
      .from("connection_requests")
      .select("id,event_id,status,first_response_at")
      .eq("is_test", false)
      .gte("created_at", periodStart.toISOString())
      .limit(5000),
    supabase
      .from("connection_feedback")
      .select("request_id,useful")
      .gte("created_at", periodStart.toISOString())
      .limit(5000)
  ]);

  const comparisonEvents = (searchResult.data ?? []) as SearchEvent[];
  const currentPeriodEvents = comparisonEvents.filter((event) => new Date(event.created_at) >= periodStart);
  const categoryOptions = [...new Set(currentPeriodEvents.flatMap((event) => event.category_id ? [event.category_id] : []))].sort((a, b) => a.localeCompare(b, "es"));
  const municipalityOptions = [...new Set(currentPeriodEvents.flatMap((event) => event.municipality ? [event.municipality] : []))].sort((a, b) => a.localeCompare(b, "es"));
  const activeCategory = rawCategory && categoryOptions.includes(rawCategory) ? rawCategory : "";
  const activeMunicipality = rawMunicipality && municipalityOptions.includes(rawMunicipality) ? rawMunicipality : "";
  const matchesSegment = (event: SearchEvent) => (
    (!activeCategory || event.category_id === activeCategory)
    && (!activeMunicipality || event.municipality === activeMunicipality)
  );
  const events = currentPeriodEvents.filter(matchesSegment);
  const previousEvents = comparisonEvents.filter((event) => new Date(event.created_at) < periodStart && matchesSegment(event));
  const filteredSearchIds = new Set(events.flatMap((event) => event.search_id ? [event.search_id] : []));
  const journeyEvents = ((journeyResult.data ?? []) as SearchJourneyEvent[]).filter((event) => event.search_id && filteredSearchIds.has(event.search_id));
  const zeroResults = events.filter((event) => event.zero_results).length;
  const searchesWithResults = events.length - zeroResults;
  const withFewResults = events.filter((event) => event.results_count > 0 && event.results_count <= 2).length;
  const averageResults = events.length ? events.reduce((sum, event) => sum + event.results_count, 0) / events.length : null;
  const terms = rankBy(events, (event) => event.normalized_query, 100).filter((item) => item.searches >= 3).slice(0, 8);
  const categories = rankBy(events, (event) => event.category_id);
  const verticals = rankBy(events, (event) => event.vertical_id);
  const municipalities = rankBy(events, (event) => event.municipality);
  const opportunities = opportunityRank(events);
  const trends = emergingTrends(events, previousEvents);
  const completedSearchIds = new Set(events.flatMap((event) => event.search_id ? [event.search_id] : []));
  const viewedAt = firstEventAt(journeyEvents, new Set(["provider_profile_viewed", "center_profile_viewed"]));
  const contactedAt = firstEventAt(journeyEvents, new Set(["contact_started", "contact_email_clicked", "contact_phone_clicked", "contact_web_clicked"]));
  const requestedAt = firstEventAt(journeyEvents, new Set(["request_created"]));
  const viewedSearchIds = new Set(viewedAt.keys());
  const contactedAfterViewIds = new Set([...contactedAt].flatMap(([searchId, occurredAt]) => {
    const viewedTimestamp = viewedAt.get(searchId);
    return viewedTimestamp !== undefined && occurredAt >= viewedTimestamp ? [searchId] : [];
  }));
  const requestedAfterContactIds = new Set([...requestedAt].flatMap(([searchId, occurredAt]) => {
    const contactedTimestamp = contactedAt.get(searchId);
    return contactedTimestamp !== undefined && occurredAt >= contactedTimestamp ? [searchId] : [];
  }));
  const requestSearchByEventId = new Map(journeyEvents.flatMap((event) => (
    event.event_name === "request_created" && event.search_id ? [[event.event_id, event.search_id] as const] : []
  )));
  const matchedRequests = ((connectionResult.data ?? []) as ConnectionRequest[]).flatMap((request) => {
    const searchId = requestSearchByEventId.get(request.event_id);
    return searchId && filteredSearchIds.has(searchId) ? [{ ...request, searchId }] : [];
  });
  const matchedRequestSearchIds = new Set(matchedRequests.map((request) => request.searchId));
  const respondedSearchIds = new Set(matchedRequests.flatMap((request) => (
    request.first_response_at || ["responded", "declined", "alternative_offered", "closed"].includes(request.status) ? [request.searchId] : []
  )));
  const feedbackRequestIds = new Set(((feedbackResult.data ?? []) as ConnectionFeedback[]).map((feedback) => feedback.request_id));
  const usefulRequestIds = new Set(((feedbackResult.data ?? []) as ConnectionFeedback[]).flatMap((feedback) => feedback.useful ? [feedback.request_id] : []));
  const feedbackSearchIds = new Set(matchedRequests.flatMap((request) => feedbackRequestIds.has(request.id) ? [request.searchId] : []));
  const usefulSearchIds = new Set(matchedRequests.flatMap((request) => usefulRequestIds.has(request.id) ? [request.searchId] : []));
  const profileViewsFromSearch = journeyEvents.filter((event) => event.search_id && ["provider_profile_viewed", "center_profile_viewed"].includes(event.event_name)).length;
  const intentOutcomes = outcomeRows(
    events,
    (event) => {
      const intent = classifySearchIntent(event.normalized_query, event.vertical_id ?? event.category_id);
      return { id: intent, label: searchIntentLabel(intent) };
    },
    matchedRequestSearchIds,
    feedbackSearchIds,
    usefulSearchIds
  ).sort((a, b) => b.searches - a.searches || b.zeroResults - a.zeroResults || a.label.localeCompare(b.label, "es"));
  const unclassifiedSearches = intentOutcomes.find((item) => item.id === "unclassified")?.searches ?? 0;
  const termOutcomes = outcomeRows(
    events,
    (event) => {
      const term = event.normalized_query?.trim();
      return term ? { id: term, label: term } : null;
    },
    matchedRequestSearchIds,
    feedbackSearchIds,
    usefulSearchIds
  )
    .filter((item) => item.searches >= 3 && item.requests > 0)
    .sort((a, b) => {
      const aUtility = a.feedback ? a.useful / a.feedback : -1;
      const bUtility = b.feedback ? b.useful / b.feedback : -1;
      return aUtility - bUtility || b.searches - a.searches || a.label.localeCompare(b.label, "es");
    })
    .slice(0, 8);

  return (
    <main className="section-shell">
      <Link href="/admin" className="inline-flex min-h-11 items-center gap-2 font-bold text-ink underline"><ArrowLeft size={18} aria-hidden />Volver a operación</Link>
      <p className="label mt-6">Informe interno</p>
      <h1 className="page-title">Demanda del piloto</h1>
      <p className="lead max-w-4xl">Qué están buscando las familias y dónde la oferta todavía no responde. Periodo del {dateLabel(periodStart)} al {dateLabel(new Date())}.</p>
      <ReportPeriodSelector activePeriod={period} pathname="/admin/demanda" preservedParams={{ category: activeCategory, municipality: activeMunicipality }} />
      <ReportSegmentFilters activeCategory={activeCategory} activeMunicipality={activeMunicipality} activePeriod={period} categoryOptions={categoryOptions} municipalityOptions={municipalityOptions} pathname="/admin/demanda" />

      {searchResult.error || journeyResult.error || connectionResult.error || feedbackResult.error ? <p className="mt-6 rounded-2xl border border-coral/30 bg-coral/10 p-4 text-sm font-semibold text-coral">No se ha podido cargar una parte del embudo de búsqueda. Comprueba que las migraciones de acceso administrativo estén aplicadas.</p> : null}

      <section className="card mt-6 p-5 md:p-6" aria-labelledby="demand-summary-title">
        <div className="flex items-center gap-3"><BarChart3 size={22} className="text-ink" aria-hidden /><div><h2 id="demand-summary-title" className="subsection-title text-ink">Resumen de {period} días</h2><p className="mt-1 text-sm text-muted">Solo datos agregados; este informe no muestra usuarios ni sesiones.{activeCategory || activeMunicipality ? " Resultados filtrados por el segmento seleccionado." : ""}</p></div></div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Búsquedas registradas</dt><dd className="mt-2 text-3xl font-black text-ink">{events.length || "Sin datos"}</dd></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Sin resultados</dt><dd className="mt-2 text-3xl font-black text-ink">{events.length ? `${zeroResults} · ${percent(zeroResults, events.length)}` : "Sin datos"}</dd></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Con oferta escasa</dt><dd className="mt-2 text-3xl font-black text-ink">{events.length ? withFewResults : "Sin datos"}</dd><p className="mt-1 text-xs text-muted">Uno o dos resultados disponibles</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Resultados medios</dt><dd className="mt-2 text-3xl font-black text-ink">{averageResults === null ? "Sin datos" : averageResults.toFixed(1)}</dd></div>
        </dl>
      </section>

      <section className="card mt-6 p-5 md:p-6" aria-labelledby="search-funnel-title">
        <div className="flex items-center gap-3"><TrendingUp size={22} className="text-ink" aria-hidden /><div><h2 id="search-funnel-title" className="subsection-title text-ink">Embudo del buscador</h2><p className="mt-1 text-sm text-muted">Recorridos unidos mediante un identificador anónimo de búsqueda. Excluye visitas directas a fichas.</p></div></div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Búsquedas completadas</dt><dd className="mt-2 text-3xl font-black text-ink">{events.length || "Sin datos"}</dd><p className="mt-1 text-xs text-muted">{completedSearchIds.size} con ID de recorrido</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="text-sm font-semibold text-muted">Con resultados</dt><dd className="mt-2 text-3xl font-black text-ink">{events.length ? searchesWithResults : "Sin datos"}</dd><p className="mt-1 text-xs text-muted">{events.length ? percent(searchesWithResults, events.length) : "Sin tasa calculable"}</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Eye size={16} aria-hidden />Llegan a una ficha</dt><dd className="mt-2 text-3xl font-black text-ink">{completedSearchIds.size ? viewedSearchIds.size : "Sin datos"}</dd><p className="mt-1 text-xs text-muted">{completedSearchIds.size ? `${percent(viewedSearchIds.size, completedSearchIds.size)} · ${(profileViewsFromSearch / completedSearchIds.size).toFixed(1)} visitas/búsqueda` : "Sin tasa calculable"}</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><MessageCircle size={16} aria-hidden />De ficha a contacto</dt><dd className="mt-2 text-3xl font-black text-ink">{viewedSearchIds.size ? percent(contactedAfterViewIds.size, viewedSearchIds.size) : "Sin datos"}</dd><p className="mt-1 text-xs text-muted">{contactedAfterViewIds.size} recorridos avanzan</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Send size={16} aria-hidden />De contacto a solicitud</dt><dd className="mt-2 text-3xl font-black text-ink">{contactedAt.size ? percent(requestedAfterContactIds.size, contactedAt.size) : "Sin datos"}</dd><p className="mt-1 text-xs text-muted">{requestedAfterContactIds.size} recorridos envían solicitud</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><CheckCircle2 size={16} aria-hidden />Solicitud a respuesta</dt><dd className="mt-2 text-3xl font-black text-ink">{matchedRequestSearchIds.size ? percent(respondedSearchIds.size, matchedRequestSearchIds.size) : "Sin datos"}</dd><p className="mt-1 text-xs text-muted">{respondedSearchIds.size} con respuesta o alternativa</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Sparkles size={16} aria-hidden />Conexión útil</dt><dd className="mt-2 text-3xl font-black text-ink">{respondedSearchIds.size ? percent(usefulSearchIds.size, respondedSearchIds.size) : "Sin datos"}</dd><p className="mt-1 text-xs text-muted">{usefulSearchIds.size} recorridos valorados como útiles</p></div>
        </dl>
        <p className="mt-4 text-xs leading-5 text-muted">Las tasas se calculan sobre búsquedas únicas, no sobre clics. Respuesta y utilidad solo incluyen solicitudes enlazables mediante un `event_id` consentido; los textos y la identidad de la familia permanecen fuera de este informe y de GA4.</p>
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <OutcomeTable
          title="Demanda por intención"
          description={`Clasificación estable a partir de la vertical seleccionada y, cuando no existe, de palabras clave del término saneado. ${unclassifiedSearches ? `${unclassifiedSearches} búsquedas permanecen sin clasificar para revisión.` : "No quedan búsquedas sin clasificar en el periodo."}`}
          items={intentOutcomes}
          emptyMessage="Todavía no hay búsquedas suficientes para clasificar la intención."
          firstColumnLabel="Intención"
        />
        <OutcomeTable
          title="Señal útil por término"
          description="Términos saneados con al menos tres búsquedas y una solicitud. «Sin feedback» significa que aún no puede calcularse utilidad; no equivale a una conexión fallida."
          items={termOutcomes}
          emptyMessage="No hay términos con muestra mínima y solicitudes asociadas en este periodo."
          firstColumnLabel="Término"
        />
      </div>

      <section className="mt-6 rounded-2xl border border-violet/20 bg-violet/5 p-5 md:p-6" aria-labelledby="opportunities-title">
        <div className="flex items-start gap-3"><TrendingUp size={22} className="mt-1 shrink-0 text-violet" aria-hidden /><div><h2 id="opportunities-title" className="subsection-title text-ink">Oportunidades de oferta</h2><p className="mt-1 text-sm leading-6 text-muted">Términos con al menos tres búsquedas, ordenados por búsquedas sin resultados. Úsalos para priorizar nuevas fichas o captar proveedores; valida antes que no sean errores o datos personales saneados.</p></div></div>
        {opportunities.length ? <ol className="mt-5 grid gap-3 md:grid-cols-2">{opportunities.map((item, index) => <li key={item.label} className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4"><span className="font-bold text-ink">{index + 1}. {item.label}</span><span className="chip shrink-0">{item.zeroResults} sin resultado</span></li>)}</ol> : <p className="mt-5 rounded-2xl border border-line bg-white p-4 text-sm text-muted">No hay términos sin resultados en el periodo.</p>}
      </section>

      <section className="card mt-6 p-5 md:p-6" aria-labelledby="emerging-searches-title">
        <div className="flex items-start gap-3"><TrendingUp size={22} className="mt-1 shrink-0 text-ink" aria-hidden /><div><h2 id="emerging-searches-title" className="subsection-title text-ink">Búsquedas emergentes</h2><p className="mt-1 text-sm leading-6 text-muted">Términos que crecen frente a los {period} días anteriores. Solo aparecen con al menos tres búsquedas actuales y no deben interpretarse como tendencia de mercado.</p></div></div>
        {trends.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-muted"><tr><th className="pb-3 pr-4">Término</th><th className="pb-3 pr-4 text-right">Periodo actual</th><th className="pb-3 pr-4 text-right">Periodo anterior</th><th className="pb-3 text-right">Variación</th></tr></thead>
              <tbody>{trends.map((trend) => <tr key={trend.label} className="border-b border-line last:border-0"><th scope="row" className="py-3 pr-4 font-semibold text-ink">{trend.label}</th><td className="py-3 pr-4 text-right text-slatecopy">{trend.current}</td><td className="py-3 pr-4 text-right text-slatecopy">{trend.previous}</td><td className="py-3 text-right font-semibold text-ink">+{trend.change}</td></tr>)}</tbody>
            </table>
          </div>
        ) : <p className="mt-5 rounded-2xl border border-line bg-soft p-4 text-sm text-muted">Aún no hay términos con muestra suficiente y crecimiento frente al periodo anterior.</p>}
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <RankingTable title="Términos más buscados" description="Consultas libres saneadas y normalizadas con al menos tres búsquedas. No se muestran emails ni teléfonos." items={terms} />
        <RankingTable title="Demanda por categoría" description="Categorías seleccionadas en el buscador, con su presión de oferta." items={categories} />
        <RankingTable title="Demanda por vertical" description="Agrupación estable para comparar educación, actividades, cuidados y otros ámbitos." items={verticals} />
        <RankingTable title="Demanda por municipio" description="Zonas donde se busca más y proporción que no encuentra resultados." items={municipalities} />
      </div>

      <section className="card mt-6 p-5 md:p-6">
        <div className="flex items-start gap-3"><SearchX size={22} className="mt-1 shrink-0 text-ink" aria-hidden /><div><h2 className="subsection-title text-ink">Cómo tomar decisiones</h2><p className="mt-2 text-sm leading-6 text-muted">Prioriza combinaciones con recurrencia y alta falta de oferta. Una búsqueda aislada no justifica captar un proveedor. Contrasta término, municipio y categoría antes de crear o enriquecer fichas.</p></div></div>
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink"><MapPin size={17} aria-hidden />Los datos reflejan búsquedas registradas, no población ni demanda total del mercado.</p>
      </section>
    </main>
  );
}
