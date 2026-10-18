import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowRight, ClipboardCheck, Download, ExternalLink, FileCheck2, Flag, History, Inbox, Mail, Phone } from "lucide-react";
import PrivateAreaUnavailable from "@/components/PrivateAreaUnavailable";
import AdminStatusControl from "@/components/AdminStatusControl";
import { feedbackContextParts, moderationStatusLabel } from "@/lib/adminFeedback";
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

function recordPayload(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function payloadText(payload: Record<string, unknown>, key: string, fallback = "No indicado") {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function requestTargetHref(type?: string | null, id?: string | null) {
  if (!id) return null;
  if (type === "center") return `/centros/${encodeURIComponent(id)}`;
  if (type === "provider") return `/servicios/${encodeURIComponent(id)}`;
  return `/anuncios/${encodeURIComponent(id)}`;
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
    supabase.from("claim_requests").select("id,entity_type,entity_id,entity_name,requester_name,requester_email,requester_phone,role_description,corrections,official_website,image_url,status,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("connection_requests").select("id,family_id,target_type,target_id,category_id,municipality,message,contact_preference,status,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("submissions").select("id,user_id,submission_type,payload,review_notes,status,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("feedback_requests").select("id,context,item_id,name,email,message,status,created_at").order("created_at", { ascending: false }).limit(100),
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
          <p className="rounded-2xl border border-line bg-white p-4 text-sm leading-6 text-slatecopy">Comprueba la relación de la persona con la entidad, contrasta la web oficial y revisa cada cambio antes de aprobar o rechazar la reclamación.</p>
          {claims.length ? claims.map((claim) => (
            <article key={claim.id} className="rounded-2xl border border-line bg-soft p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-ink">{claim.entity_name}</strong><span className="chip">{moderationStatusLabel(claim.status)}</span></div>
              <div className="mt-2"><PriorityFlag visible={overdueClaims.some((item) => item.id === claim.id)} label="Más de 4 días laborables" /></div>
              <p className="mt-3 line-clamp-3 leading-6 text-slatecopy">{claim.corrections || "No se han indicado cambios concretos."}</p>
              <p className="mt-2 font-semibold text-ink">{claim.requester_name} · {claim.role_description}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <a className="inline-flex items-center gap-1.5 font-semibold text-ink underline" href={`mailto:${claim.requester_email}`}><Mail size={15} aria-hidden />{claim.requester_email}</a>
                {claim.requester_phone ? <a className="inline-flex items-center gap-1.5 font-semibold text-ink underline" href={`tel:${claim.requester_phone.replace(/[^+\d]/g, "")}`}><Phone size={15} aria-hidden />{claim.requester_phone}</a> : null}
              </div>
              <details className="mt-4 rounded-xl border border-line bg-white p-3">
                <summary className="cursor-pointer font-bold text-ink">Ver información aportada</summary>
                <dl className="mt-3 grid gap-2 text-xs text-muted">
                  <div><dt className="inline font-bold text-ink">Tipo y referencia: </dt><dd className="inline break-all">{claim.entity_type} · {claim.entity_id}</dd></div>
                  <div><dt className="inline font-bold text-ink">Cambios solicitados: </dt><dd className="inline whitespace-pre-wrap">{claim.corrections || "No indicados"}</dd></div>
                  {claim.official_website ? <div><dt className="inline font-bold text-ink">Web oficial: </dt><dd className="inline"><a href={claim.official_website} target="_blank" rel="noreferrer" className="break-all underline">{claim.official_website} <ExternalLink className="inline" size={13} aria-hidden /></a></dd></div> : null}
                  {claim.image_url ? <div><dt className="inline font-bold text-ink">Imagen sugerida: </dt><dd className="inline break-all">{claim.image_url}</dd></div> : null}
                </dl>
              </details>
              <p className="mt-2 text-xs text-muted">{dateLabel(claim.created_at)}</p>
              <AdminStatusControl queue="claim" recordId={claim.id} currentStatus={claim.status} />
            </article>
          )) : <p className="text-sm text-muted">No hay reclamaciones.</p>}
        </QueueSection>

        <QueueSection title="Solicitudes" count={requests.length} Icon={ClipboardCheck}>
          {requests.length ? requests.map((request) => (
            <article key={request.id} className="rounded-2xl border border-line bg-soft p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-ink">Solicitud para {request.target_id ?? "una opción sin identificar"}</strong><span className="chip">{moderationStatusLabel(request.status)}</span></div>
              <div className="mt-2"><PriorityFlag visible={overdueRequests.some((item) => item.id === request.id)} label="Más de 48 horas" /></div>
              <p className="mt-3 whitespace-pre-wrap leading-6 text-slatecopy">{request.message || "La familia no añadió un mensaje."}</p>
              <p className="mt-2 text-muted">{request.category_id ?? "Sin categoría"} · {request.municipality ?? "Sin municipio"}</p>
              <p className="mt-1 text-xs text-muted">Canal preferido: {request.contact_preference === "phone" ? "Teléfono" : request.contact_preference === "email" ? "Email" : "A través de Tenlo"}</p>
              {requestTargetHref(request.target_type, request.target_id) ? <Link href={requestTargetHref(request.target_type, request.target_id)!} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 font-bold text-ink">Abrir ficha <ExternalLink size={15} aria-hidden /></Link> : null}
              <p className="mt-2 text-xs text-muted">{dateLabel(request.created_at)}</p>
              <AdminStatusControl queue="connection" recordId={request.id} currentStatus={request.status} />
            </article>
          )) : <p className="text-sm text-muted">No hay solicitudes.</p>}
        </QueueSection>

        <QueueSection title="Publicaciones y bajas" count={submissions.length} Icon={Inbox}>
          {submissions.length ? submissions.map((submission) => {
            const payload = recordPayload(submission.payload);
            return <article key={submission.id} className="rounded-2xl border border-line bg-soft p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-ink">{payloadText(payload, "title", "Publicación sin título")}</strong><span className="chip">{moderationStatusLabel(submission.status)}</span></div>
              <div className="mt-2"><PriorityFlag visible={overdueSubmissions.some((item) => item.id === submission.id)} label="Más de 4 días laborables" /></div>
              <p className="mt-3 line-clamp-3 leading-6 text-slatecopy">{payloadText(payload, "description", "No se añadió una descripción.")}</p>
              <p className="mt-2 text-muted">{payloadText(payload, "category")} · {payloadText(payload, "municipality")}</p>
              <details className="mt-4 rounded-xl border border-line bg-white p-3">
                <summary className="cursor-pointer font-bold text-ink">Ver datos de publicación</summary>
                <dl className="mt-3 grid gap-2 text-xs text-muted">
                  <div><dt className="inline font-bold text-ink">Tipo: </dt><dd className="inline">{submission.submission_type}</dd></div>
                  <div><dt className="inline font-bold text-ink">Centro: </dt><dd className="inline">{payloadText(payload, "center")}</dd></div>
                  <div><dt className="inline font-bold text-ink">Edad: </dt><dd className="inline">{payloadText(payload, "recommended_age")}</dd></div>
                  <div><dt className="inline font-bold text-ink">Precio: </dt><dd className="inline">{payloadText(payload, "price")}</dd></div>
                  <div><dt className="inline font-bold text-ink">Contacto: </dt><dd className="inline break-all">{payloadText(payload, "contact")}</dd></div>
                  <div><dt className="inline font-bold text-ink">Fuente: </dt><dd className="inline">{payloadText(payload, "source")}</dd></div>
                  {submission.review_notes ? <div><dt className="inline font-bold text-ink">Notas de revisión: </dt><dd className="inline">{submission.review_notes}</dd></div> : null}
                </dl>
              </details>
              <p className="mt-2 text-xs text-muted">{dateLabel(submission.created_at)}</p>
              <AdminStatusControl queue="submission" recordId={submission.id} currentStatus={submission.status} />
            </article>;
          }) : <p className="text-sm text-muted">No hay publicaciones ni bajas pendientes.</p>}
        </QueueSection>

        <QueueSection title="Avisos e incidencias" count={feedback.length} Icon={Flag}>
          <div className="rounded-2xl border border-line bg-white p-4 text-sm leading-6 text-slatecopy">
            <strong className="text-ink">Cómo gestionar esta cola</strong>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Abre la incidencia y comprueba el mensaje y la ficha relacionada.</li>
              <li>Contacta con la persona si falta información.</li>
              <li>Márcala como Resuelta, Descartada o Archivada.</li>
            </ol>
          </div>
          {feedback.length ? feedback.map((item) => (
            <article key={item.id} className="rounded-2xl border border-line bg-soft p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-ink">{feedbackContextParts(item.context).title}</strong><span className="chip">{moderationStatusLabel(item.status)}</span></div>
              <div className="mt-2"><PriorityFlag visible={overdueFeedback.some((overdueItem) => overdueItem.id === item.id)} label="Más de 4 días laborables" /></div>
              <p className="mt-3 line-clamp-3 leading-6 text-slatecopy">{item.message}</p>
              <dl className="mt-3 grid gap-1 text-xs text-muted">
                <div><dt className="inline font-bold text-ink">Enviado por: </dt><dd className="inline break-all">{item.name || item.email || "Usuario no identificado"}{item.name && item.email ? ` · ${item.email}` : ""}</dd></div>
                <div><dt className="inline font-bold text-ink">Recibido: </dt><dd className="inline">{dateLabel(item.created_at)}</dd></div>
                {item.item_id ? <div><dt className="inline font-bold text-ink">Referencia: </dt><dd className="inline break-all">{item.item_id}</dd></div> : null}
              </dl>
              <Link href={`/admin/incidencias/${item.id}`} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 font-bold text-ink hover:border-ink">
                Ver incidencia completa <ArrowRight size={16} aria-hidden />
              </Link>
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
