import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, CheckCircle2, Clock3, Eye, Inbox, MousePointerClick, Target } from "lucide-react";
import PrintProviderReportButton from "@/components/PrintProviderReportButton";
import PrivateAreaUnavailable from "@/components/PrivateAreaUnavailable";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Informe de rendimiento | Tenlo", description: "Resumen privado del rendimiento de tus fichas en Tenlo.", robots: { index: false, follow: false } };

type Performance = { impressions: number; profile_views: number; saves: number; contact_intents: number; requests: number };
type RequestRow = { status: string; relevance: "relevant" | "irrelevant" | null; first_response_at: string | null; created_at: string };
const emptyPerformance: Performance = { impressions: 0, profile_views: 0, saves: 0, contact_intents: 0, requests: 0 };

function percentage(part: number, total: number) { return total ? `${Math.round((part / total) * 100)} %` : "Sin datos"; }
function comparison(current: number, previous: number) {
  if (!previous) return current ? "Nueva actividad" : "Sin actividad todavía";
  const change = Math.round(((current - previous) / previous) * 100);
  return change ? `${change > 0 ? "+" : ""}${change} % vs. periodo anterior` : "Igual que el periodo anterior";
}
function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
function duration(milliseconds: number | null) {
  if (milliseconds === null) return "Sin datos";
  const hours = milliseconds / 3_600_000;
  return hours < 48 ? `${hours.toFixed(hours < 10 ? 1 : 0)} h` : `${(hours / 24).toFixed(1)} días`;
}

export default async function ProviderPerformancePage() {
  if (!hasSupabaseServerConfig()) return <PrivateAreaUnavailable />;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=/rendimiento-profesional");
  const { data: profile } = await supabase.from("profiles").select("role,display_name").eq("id", authData.user.id).maybeSingle();
  if (!profile || profile.role === "family" || profile.role === "tenlo_admin") redirect("/area-personal");

  const [businessResult, currentResult, previousResult, requestsResult] = await Promise.all([
    supabase.from("business_profiles").select("business_name").eq("owner_id", authData.user.id).eq("status", "approved").order("business_name"),
    supabase.rpc("get_provider_private_performance", { window_days: 30, offset_days: 0 }),
    supabase.rpc("get_provider_private_performance", { window_days: 30, offset_days: 30 }),
    supabase.rpc("get_provider_connection_requests_v2")
  ]);
  const queryError = businessResult.error || currentResult.error || previousResult.error || requestsResult.error;
  const current = (currentResult.data?.[0] as Performance | undefined) ?? emptyPerformance;
  const previous = (previousResult.data?.[0] as Performance | undefined) ?? emptyPerformance;
  const requests = (requestsResult.data ?? []) as RequestRow[];
  const responses = requests.filter((item) => item.first_response_at || ["responded", "declined", "closed"].includes(item.status));
  const rated = requests.filter((item) => item.relevance);
  const relevant = rated.filter((item) => item.relevance === "relevant").length;
  const responseTimes = requests.flatMap((item) => item.first_response_at ? [new Date(item.first_response_at).getTime() - new Date(item.created_at).getTime()] : []).filter((value) => value >= 0);
  const names = (businessResult.data ?? []).map((item) => item.business_name).join(", ") || profile.display_name || "Proveedor Tenlo";
  const generatedAt = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(new Date());
  const cards = [
    { label: "Apariciones", value: current.impressions, previous: previous.impressions, Icon: Eye },
    { label: "Aperturas de ficha", value: current.profile_views, previous: previous.profile_views, Icon: MousePointerClick },
    { label: "Guardados", value: current.saves, previous: previous.saves, Icon: Bookmark },
    { label: "Intenciones de contacto", value: current.contact_intents, previous: previous.contact_intents, Icon: Target }
  ];

  return (
    <main className="section-shell print:bg-white print:py-0">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="label">Informe privado</p><h1 className="page-title">Rendimiento en Tenlo</h1><p className="lead">{names}</p></div>
        <PrintProviderReportButton />
      </div>
      <p className="mt-3 text-sm text-muted">Generado el {generatedAt}. Últimos 30 días comparados con los 30 anteriores.</p>
      {queryError ? <p className="mt-6 rounded-2xl border border-coral/30 bg-coral/10 p-4 text-sm font-semibold text-coral">No se ha podido preparar el informe completo.</p> : null}

      <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Visibilidad e interés">
        {cards.map(({ label, value, previous: previousValue, Icon }) => <div key={label} className="rounded-2xl border border-line bg-panel p-5"><p className="flex items-center gap-2 text-sm font-semibold text-muted"><Icon size={17} aria-hidden />{label}</p><p className="mt-3 text-3xl font-black text-ink">{value}</p><p className="mt-1 text-xs text-muted">{comparison(value, previousValue)}</p></div>)}
      </section>

      <section className="card mt-6 p-5" aria-labelledby="opportunity-title">
        <h2 id="opportunity-title" className="subsection-title">Oportunidades recibidas</h2>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Inbox size={16} aria-hidden />Solicitudes</dt><dd className="mt-2 text-3xl font-black">{requests.length}</dd></div>
          <div className="rounded-2xl bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><CheckCircle2 size={16} aria-hidden />Respondidas</dt><dd className="mt-2 text-3xl font-black">{responses.length}</dd><p className="text-xs text-muted">{percentage(responses.length, requests.length)}</p></div>
          <div className="rounded-2xl bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Clock3 size={16} aria-hidden />Tiempo mediano</dt><dd className="mt-2 text-3xl font-black">{duration(median(responseTimes))}</dd></div>
          <div className="rounded-2xl bg-soft p-4"><dt className="flex items-center gap-2 text-sm font-semibold text-muted"><Target size={16} aria-hidden />Relevantes</dt><dd className="mt-2 text-3xl font-black">{relevant}</dd><p className="text-xs text-muted">{percentage(relevant, rated.length)} de {rated.length} valoradas</p></div>
        </dl>
      </section>

      <div className="mt-6 rounded-2xl border border-line bg-soft p-4 text-sm leading-6 text-muted"><strong className="text-ink">Cómo interpretar este informe.</strong> Las señales de visibilidad se registran solo cuando existe consentimiento estadístico. Una visita o una intención de contacto no equivale a una contratación. Los valores cero significan que no se registró actividad consentida en el periodo.</div>
      <Link href="/solicitudes-profesionales" className="btn-secondary mt-6 print:hidden">Volver a solicitudes</Link>
    </main>
  );
}
