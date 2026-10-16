import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle, ClipboardCheck, Download, FileCheck2, Flag, History, Inbox } from "lucide-react";
import PrivateAreaUnavailable from "@/components/PrivateAreaUnavailable";
import AdminStatusControl from "@/components/AdminStatusControl";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Operación del piloto | Tenlo",
  robots: { index: false, follow: false }
};

function dateLabel(value?: string | null) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function isOlderThanHours(value: string | null | undefined, hours: number) {
  if (!value) return false;
  return Date.now() > new Date(value).getTime() + hours * 60 * 60 * 1000;
}

function businessDeadline(value: string | null | undefined, businessDays: number) {
  if (!value) return null;
  const deadline = new Date(value);
  let added = 0;
  while (added < businessDays) {
    deadline.setDate(deadline.getDate() + 1);
    const day = deadline.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return deadline;
}

function isPastBusinessDaySla(value: string | null | undefined, businessDays: number) {
  const deadline = businessDeadline(value, businessDays);
  return deadline ? Date.now() > deadline.getTime() : false;
}

function staleReviewCutoff(days = 180) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff.toISOString().slice(0, 10);
}

function PriorityFlag({ visible, label }: { visible: boolean; label: string }) {
  if (!visible) return null;
  return <span className="inline-flex items-center gap-1 rounded-full bg-coral/10 px-2.5 py-1 text-xs font-bold text-coral"><AlertTriangle size={14} aria-hidden />{label}</span>;
}

function QueueSection({ title, count, children, Icon }: { title: string; count: number; children: React.ReactNode; Icon: typeof Inbox }) {
  return (
    <section className="card p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Icon size={22} className="text-ink" aria-hidden />
          <h2 className="subsection-title text-ink">{title}</h2>
        </div>
        <span className="chip">{count}</span>
      </div>
      <div className="mt-5 grid gap-3">{children}</div>
    </section>
  );
}

export default async function AdminPage() {
  if (!hasSupabaseServerConfig()) return <PrivateAreaUnavailable />;

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", authData.user.id).maybeSingle();
  if (profile?.role !== "tenlo_admin" || profile.status !== "approved") redirect("/area-personal");

  const reviewCutoff = staleReviewCutoff();
  const [claimsResult, requestsResult, submissionsResult, feedbackResult, auditResult, staleServicesResult, staleCentersResult] = await Promise.all([
    supabase.from("claim_requests").select("id,entity_type,entity_id,entity_name,requester_name,requester_email,status,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("connection_requests").select("id,target_type,target_id,category_id,municipality,status,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("submissions").select("id,submission_type,status,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("feedback_requests").select("id,context,item_id,name,email,status,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("admin_queue_audit").select("id,queue,record_id,previous_status,new_status,changed_by,changed_at").order("changed_at", { ascending: false }).limit(30),
    supabase.from("services").select("id,title,municipality,last_reviewed").eq("status", "approved").or(`last_reviewed.is.null,last_reviewed.lt.${reviewCutoff}`).order("last_reviewed", { ascending: true, nullsFirst: true }).limit(50),
    supabase.from("centers").select("id,name,municipality,last_reviewed").or(`last_reviewed.is.null,last_reviewed.lt.${reviewCutoff}`).order("last_reviewed", { ascending: true, nullsFirst: true }).limit(50)
  ]);

  const queryError = claimsResult.error || requestsResult.error || submissionsResult.error || feedbackResult.error || auditResult.error || staleServicesResult.error || staleCentersResult.error;
  const claims = claimsResult.data ?? [];
  const requests = requestsResult.data ?? [];
  const submissions = submissionsResult.data ?? [];
  const feedback = feedbackResult.data ?? [];
  const audit = auditResult.data ?? [];
  const staleServices = staleServicesResult.data ?? [];
  const staleCenters = staleCentersResult.data ?? [];
  const overdueClaims = claims.filter((item) => ["draft", "pending_review"].includes(item.status) && isPastBusinessDaySla(item.created_at, 4));
  const overdueRequests = requests.filter((item) => !["responded", "declined", "closed"].includes(item.status) && isOlderThanHours(item.created_at, 48));
  const overdueSubmissions = submissions.filter((item) => ["draft", "pending_review"].includes(item.status) && isPastBusinessDaySla(item.created_at, 4));
  const overdueFeedback = feedback.filter((item) => ["draft", "pending_review"].includes(item.status) && isPastBusinessDaySla(item.created_at, 4));
  const staleTotal = staleServices.length + staleCenters.length;
  const overdueTotal = overdueClaims.length + overdueRequests.length + overdueSubmissions.length + overdueFeedback.length + staleTotal;

  return (
    <main className="section-shell">
      <p className="label">Acceso restringido</p>
      <h1 className="page-title">Operación del piloto</h1>
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <p className="lead max-w-4xl">Cola privada para revisar reclamaciones, solicitudes y tareas recibidas. Los datos de contacto se usan solo para gestionar cada petición.</p>
        <a href="/api/admin/export" className="btn-secondary shrink-0" download>
          <Download size={18} aria-hidden />
          Exportar CSV
        </a>
      </div>
      <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">La exportación contiene datos operativos y de contacto. Guárdala solo mientras sea necesaria y no la compartas fuera de la gestión del piloto.</p>
      {queryError ? <p className="mt-6 rounded-2xl border border-coral/30 bg-coral/10 p-4 text-sm font-semibold text-coral">No se ha podido cargar una parte de la cola. Revisa las políticas y vuelve a intentarlo.</p> : null}
      {overdueTotal > 0 ? (
        <section className="mt-6 rounded-2xl border border-coral/30 bg-coral/10 p-4" aria-label="Alertas de plazo">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-coral" size={22} aria-hidden />
            <div>
              <h2 className="text-base font-bold text-ink">{overdueTotal} {overdueTotal === 1 ? "tarea requiere" : "tareas requieren"} atención</h2>
              <p className="mt-1 text-sm leading-6 text-slatecopy">Solicitudes abiertas durante más de 48 horas, revisiones pendientes que superan cuatro días laborables o fichas sin revisar en los últimos 180 días.</p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <QueueSection title="Reclamaciones" count={claims.length} Icon={FileCheck2}>
          {claims.length ? claims.map((claim) => (
            <article key={claim.id} className="rounded-2xl border border-line bg-soft p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-ink">{claim.entity_name}</strong><span className="chip">{claim.status}</span></div>
              <div className="mt-2"><PriorityFlag visible={overdueClaims.some((item) => item.id === claim.id)} label="Más de 4 días laborables" /></div>
              <p className="mt-2 text-slatecopy">{claim.entity_type} · {claim.entity_id}</p>
              <p className="mt-1 break-all text-muted">{claim.requester_name} · {claim.requester_email}</p>
              <p className="mt-2 text-xs text-muted">{dateLabel(claim.created_at)}</p>
              <AdminStatusControl queue="claim" recordId={claim.id} currentStatus={claim.status} />
            </article>
          )) : <p className="text-sm text-muted">No hay reclamaciones.</p>}
        </QueueSection>

        <QueueSection title="Solicitudes" count={requests.length} Icon={ClipboardCheck}>
          {requests.length ? requests.map((request) => (
            <article key={request.id} className="rounded-2xl border border-line bg-soft p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-ink">{request.target_id ?? "Sin ficha"}</strong><span className="chip">{request.status}</span></div>
              <div className="mt-2"><PriorityFlag visible={overdueRequests.some((item) => item.id === request.id)} label="Más de 48 horas" /></div>
              <p className="mt-2 text-slatecopy">{request.category_id ?? "Sin categoría"} · {request.municipality ?? "Sin municipio"}</p>
              <p className="mt-2 text-xs text-muted">{dateLabel(request.created_at)}</p>
              <AdminStatusControl queue="connection" recordId={request.id} currentStatus={request.status} />
            </article>
          )) : <p className="text-sm text-muted">No hay solicitudes.</p>}
        </QueueSection>

        <QueueSection title="Publicaciones y bajas" count={submissions.length} Icon={Inbox}>
          {submissions.length ? submissions.map((submission) => (
            <article key={submission.id} className="rounded-2xl border border-line bg-soft p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-ink">{submission.submission_type}</strong><span className="chip">{submission.status}</span></div>
              <div className="mt-2"><PriorityFlag visible={overdueSubmissions.some((item) => item.id === submission.id)} label="Más de 4 días laborables" /></div>
              <p className="mt-2 text-xs text-muted">{dateLabel(submission.created_at)}</p>
              <AdminStatusControl queue="submission" recordId={submission.id} currentStatus={submission.status} />
            </article>
          )) : <p className="text-sm text-muted">No hay publicaciones ni bajas pendientes.</p>}
        </QueueSection>

        <QueueSection title="Avisos e incidencias" count={feedback.length} Icon={Flag}>
          {feedback.length ? feedback.map((item) => (
            <article key={item.id} className="rounded-2xl border border-line bg-soft p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-ink">{item.context ?? "Aviso general"}</strong><span className="chip">{item.status}</span></div>
              <div className="mt-2"><PriorityFlag visible={overdueFeedback.some((overdueItem) => overdueItem.id === item.id)} label="Más de 4 días laborables" /></div>
              <p className="mt-2 text-slatecopy">{item.item_id ?? "Sin ficha asociada"}</p>
              {item.email ? <p className="mt-1 break-all text-muted">{item.name ? `${item.name} · ` : ""}{item.email}</p> : null}
              <p className="mt-2 text-xs text-muted">{dateLabel(item.created_at)}</p>
              <AdminStatusControl queue="feedback" recordId={item.id} currentStatus={item.status} />
            </article>
          )) : <p className="text-sm text-muted">No hay avisos pendientes.</p>}
        </QueueSection>
      </div>

      <section className="card mt-5 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle size={22} className="text-ink" aria-hidden />
            <h2 className="subsection-title text-ink">Fichas pendientes de actualización</h2>
          </div>
          <span className="chip">{staleTotal}</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">Fichas publicadas sin fecha de revisión o cuya última revisión supera 180 días. La alerta no cambia su visibilidad automáticamente.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {staleServices.map((service) => (
            <article key={`service-${service.id}`} className="rounded-2xl border border-line bg-soft p-4 text-sm">
              <strong className="text-ink">{service.title}</strong>
              <p className="mt-1 text-slatecopy">Servicio · {service.municipality}</p>
              <p className="mt-2 text-xs text-muted">Última revisión: {service.last_reviewed ? dateLabel(service.last_reviewed) : "No indicada"}</p>
            </article>
          ))}
          {staleCenters.map((center) => (
            <article key={`center-${center.id}`} className="rounded-2xl border border-line bg-soft p-4 text-sm">
              <strong className="text-ink">{center.name}</strong>
              <p className="mt-1 text-slatecopy">Centro · {center.municipality}</p>
              <p className="mt-2 text-xs text-muted">Última revisión: {center.last_reviewed ? dateLabel(center.last_reviewed) : "No indicada"}</p>
            </article>
          ))}
          {!staleTotal ? <p className="text-sm text-muted">No hay fichas que superen el umbral de revisión.</p> : null}
        </div>
      </section>

      <section className="card mt-5 p-5 md:p-6">
        <div className="flex items-center gap-3">
          <History size={22} className="text-ink" aria-hidden />
          <h2 className="subsection-title text-ink">Últimos cambios de estado</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">Registro interno de las últimas acciones realizadas desde esta cola.</p>
        <div className="mt-5 grid gap-3">
          {audit.length ? audit.map((entry) => (
            <article key={entry.id} className="rounded-2xl border border-line bg-soft p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-ink">{entry.queue} · {entry.record_id}</strong>
                <span className="text-xs text-muted">{dateLabel(entry.changed_at)}</span>
              </div>
              <p className="mt-2 text-slatecopy"><span className="chip">{entry.previous_status}</span> <span aria-hidden>→</span> <span className="chip">{entry.new_status}</span></p>
              <p className="mt-2 break-all text-xs text-muted">Responsable: {entry.changed_by ?? "Sistema"}</p>
            </article>
          )) : <p className="text-sm text-muted">Todavía no hay cambios de estado registrados.</p>}
        </div>
      </section>
    </main>
  );
}
