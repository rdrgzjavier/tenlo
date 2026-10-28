import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, BriefcaseBusiness, CheckCircle2, Clock3, Eye, Inbox, MousePointerClick, ShieldCheck, Target } from "lucide-react";
import PrivateAreaUnavailable from "@/components/PrivateAreaUnavailable";
import ProviderRequestResponseForm from "@/components/ProviderRequestResponseForm";
import ProviderRequestViewedTracker from "@/components/ProviderRequestViewedTracker";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Solicitudes recibidas | Tenlo",
  description: "Consulta y responde las solicitudes recibidas por tus fichas profesionales.",
  robots: { index: false, follow: false }
};

type ProviderRequest = {
  id: string;
  provider_id: string;
  target_id: string | null;
  category_id: string | null;
  municipality: string | null;
  message: string | null;
  contact_preference: string;
  status: string;
  relevance: "relevant" | "irrelevant" | null;
  provider_response_summary: string | null;
  provider_notified_at: string | null;
  first_response_at: string | null;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  submitted: "Nueva",
  delivered: "Entregada",
  viewed: "Vista",
  responded: "Respondida",
  declined: "Sin disponibilidad",
  alternative_requested: "Alternativa solicitada",
  alternative_offered: "Alternativa ofrecida",
  closed: "Cerrada"
};

const contactLabels: Record<string, string> = {
  tenlo: "Respuesta dentro de Tenlo",
  email: "Preferencia de la familia: email",
  phone: "Preferencia de la familia: teléfono"
};

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

type PerformanceSummary = { impressions: number; profile_views: number; saves: number; contact_intents: number; requests: number };
const emptyPerformance: PerformanceSummary = { impressions: 0, profile_views: 0, saves: 0, contact_intents: 0, requests: 0 };

function comparisonLabel(current: number, previous: number) {
  if (!previous) return current ? "Nueva actividad" : "Sin actividad todavía";
  const change = Math.round(((current - previous) / previous) * 100);
  if (!change) return "Igual que el periodo anterior";
  return `${change > 0 ? "+" : ""}${change} % frente a los 30 días anteriores`;
}

export default async function ProviderRequestsPage() {
  if (!hasSupabaseServerConfig()) return <PrivateAreaUnavailable />;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=/solicitudes-profesionales");

  const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", authData.user.id).maybeSingle();
  if (!profile || profile.role === "family" || profile.role === "tenlo_admin") redirect("/area-personal");

  const [businessResult, requestsResult, performanceResult, previousPerformanceResult] = await Promise.all([
    supabase.from("business_profiles").select("id,business_name,status,accepts_requests").eq("owner_id", authData.user.id).order("created_at", { ascending: false }),
    supabase.rpc("get_provider_connection_requests_v2"),
    supabase.rpc("get_provider_private_performance", { window_days: 30, offset_days: 0 }),
    supabase.rpc("get_provider_private_performance", { window_days: 30, offset_days: 30 })
  ]);
  const businesses = businessResult.data ?? [];
  const businessNames = new Map(businesses.map((business) => [business.id, business.business_name]));
  const requests = (requestsResult.data ?? []) as ProviderRequest[];
  const respondedRequests = requests.filter((request) => request.first_response_at || ["responded", "declined", "closed"].includes(request.status)).length;
  const ratedRequests = requests.filter((request) => request.relevance);
  const relevantRequests = ratedRequests.filter((request) => request.relevance === "relevant").length;
  const responseTimes = requests.flatMap((request) => request.first_response_at ? [new Date(request.first_response_at).getTime() - new Date(request.created_at).getTime()] : []).filter((duration) => duration >= 0);
  const viewableRequestIds = requests.filter((request) => ["submitted", "delivered"].includes(request.status)).map((request) => request.id);
  const performance = (performanceResult.data?.[0] as PerformanceSummary | undefined) ?? emptyPerformance;
  const previousPerformance = (previousPerformanceResult.data?.[0] as PerformanceSummary | undefined) ?? emptyPerformance;
  const queryError = businessResult.error || requestsResult.error || performanceResult.error || previousPerformanceResult.error;

  return (
    <main className="section-shell">
      <p className="label">Área profesional</p>
      <h1 className="page-title">Solicitudes recibidas</h1>
      <p className="lead max-w-4xl">Responde desde Tenlo sin acceder a la identidad ni a los datos de contacto de la familia. La familia verá tu respuesta en su área privada.</p>
      <ProviderRequestViewedTracker recordIds={viewableRequestIds} />
      <div className="mt-5 print:hidden"><Link href="/rendimiento-profesional" className="btn-secondary">Ver informe de rendimiento</Link></div>

      {queryError ? <p className="mt-6 rounded-2xl border border-coral/30 bg-coral/10 p-4 text-sm font-semibold text-coral">La bandeja todavía no está disponible. Comprueba que la migración del flujo profesional esté aplicada.</p> : null}

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-sage/30 bg-sage/10 p-4 text-sm leading-6 text-slatecopy"><ShieldCheck className="mt-0.5 shrink-0 text-petrol" size={20} aria-hidden /><p><strong className="text-ink">Contacto protegido.</strong> No solicites ni compartas nombres completos, fotos, colegio, clase, horarios personales ni otros datos identificativos de menores.</p></div>

      <section className="card mt-6 p-5" aria-labelledby="provider-request-summary-title">
        <h2 id="provider-request-summary-title" className="subsection-title text-ink">Resumen de tus solicitudes</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Datos de tus fichas para entender si las oportunidades son relevantes y se responden a tiempo. No es una puntuación pública.</p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Inbox size={16} aria-hidden />Recibidas</dt><dd className="mt-2 text-3xl font-black text-ink">{requests.length}</dd></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><CheckCircle2 size={16} aria-hidden />Respondidas</dt><dd className="mt-2 text-3xl font-black text-ink">{respondedRequests}</dd><p className="mt-1 text-xs text-muted">{percentage(respondedRequests, requests.length)}</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Clock3 size={16} aria-hidden />Tiempo mediano</dt><dd className="mt-2 text-3xl font-black text-ink">{durationLabel(median(responseTimes))}</dd></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Target size={16} aria-hidden />Relevantes</dt><dd className="mt-2 text-3xl font-black text-ink">{relevantRequests}</dd><p className="mt-1 text-xs text-muted">{percentage(relevantRequests, ratedRequests.length)} de {ratedRequests.length} valoradas</p></div>
        </dl>
      </section>

      <section className="card mt-6 p-5" aria-labelledby="provider-performance-title">
        <h2 id="provider-performance-title" className="subsection-title text-ink">Visibilidad de tus fichas</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Actividad consentida de los últimos 30 días. Se compara con los 30 días anteriores y no identifica a las familias.</p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Eye size={16} aria-hidden />Apariciones</dt><dd className="mt-2 text-3xl font-black text-ink">{performance.impressions}</dd><p className="mt-1 text-xs text-muted">{comparisonLabel(performance.impressions, previousPerformance.impressions)}</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><MousePointerClick size={16} aria-hidden />Aperturas de ficha</dt><dd className="mt-2 text-3xl font-black text-ink">{performance.profile_views}</dd><p className="mt-1 text-xs text-muted">{comparisonLabel(performance.profile_views, previousPerformance.profile_views)}</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Bookmark size={16} aria-hidden />Guardados</dt><dd className="mt-2 text-3xl font-black text-ink">{performance.saves}</dd><p className="mt-1 text-xs text-muted">{comparisonLabel(performance.saves, previousPerformance.saves)}</p></div>
          <div className="rounded-2xl border border-line bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Target size={16} aria-hidden />Intenciones de contacto</dt><dd className="mt-2 text-3xl font-black text-ink">{performance.contact_intents}</dd><p className="mt-1 text-xs text-muted">{comparisonLabel(performance.contact_intents, previousPerformance.contact_intents)}</p></div>
        </dl>
        <p className="mt-4 text-xs leading-5 text-muted">Los datos pueden ser cero si no hubo actividad consentida. No equivalen a clientes ni a contrataciones confirmadas.</p>
      </section>

      {requests.length ? (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {requests.map((request) => {
            const canRespond = !["closed", "alternative_offered"].includes(request.status);
            return (
              <article key={request.id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2"><span className="chip">{statusLabels[request.status] ?? request.status}</span><span className="text-xs text-muted">{new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(request.created_at))}</span></div>
                <h2 className="mt-4 text-lg font-bold text-ink">{businessNames.get(request.provider_id) ?? "Ficha profesional"}</h2>
                <p className="mt-1 text-sm text-muted">{request.category_id || "Categoría no indicada"} · {request.municipality || "Municipio no indicado"}</p>
                <div className="mt-4 rounded-2xl border border-line bg-soft p-4"><p className="text-xs font-bold uppercase tracking-wide text-muted">Necesidad de la familia</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slatecopy">{request.message || "La familia no añadió más información."}</p></div>
                <p className="mt-3 text-xs font-semibold text-muted">{contactLabels[request.contact_preference] ?? "Respuesta dentro de Tenlo"}. Tenlo no muestra el dato de contacto en esta pantalla.</p>
                {request.provider_response_summary ? <div className="mt-4 rounded-2xl border border-primary/20 bg-violet/5 p-4"><p className="text-xs font-bold uppercase tracking-wide text-primary">Tu respuesta actual</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slatecopy">{request.provider_response_summary}</p></div> : null}
                {canRespond ? <ProviderRequestResponseForm recordId={request.id} initialRelevance={request.relevance} /> : null}
              </article>
            );
          })}
        </div>
      ) : (
        <section className="mt-8 max-w-2xl rounded-[24px] border border-line bg-panel p-8 text-center shadow-soft">
          <Inbox className="mx-auto text-ink" size={32} aria-hidden />
          <h2 className="mt-4 text-2xl font-bold text-ink">Todavía no hay solicitudes asignadas</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Tu ficha debe estar aprobada, vinculada a sus servicios y configurada para aceptar solicitudes. Tenlo te avisará cuando llegue una petición adecuada.</p>
          <Link href="/mi-ficha-profesional" className="btn-primary mt-6"><BriefcaseBusiness size={18} aria-hidden />Revisar mi ficha</Link>
        </section>
      )}
    </main>
  );
}
