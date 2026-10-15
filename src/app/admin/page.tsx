import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClipboardCheck, Download, FileCheck2, Flag, Inbox } from "lucide-react";
import PrivateAreaUnavailable from "@/components/PrivateAreaUnavailable";
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

  const [claimsResult, requestsResult, submissionsResult, feedbackResult] = await Promise.all([
    supabase.from("claim_requests").select("id,entity_type,entity_id,entity_name,requester_name,requester_email,status,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("connection_requests").select("id,target_type,target_id,category_id,municipality,status,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("submissions").select("id,submission_type,status,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("feedback_requests").select("id,context,item_id,name,email,status,created_at").order("created_at", { ascending: false }).limit(100)
  ]);

  const queryError = claimsResult.error || requestsResult.error || submissionsResult.error || feedbackResult.error;
  const claims = claimsResult.data ?? [];
  const requests = requestsResult.data ?? [];
  const submissions = submissionsResult.data ?? [];
  const feedback = feedbackResult.data ?? [];

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

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <QueueSection title="Reclamaciones" count={claims.length} Icon={FileCheck2}>
          {claims.length ? claims.map((claim) => (
            <article key={claim.id} className="rounded-2xl border border-line bg-soft p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-ink">{claim.entity_name}</strong><span className="chip">{claim.status}</span></div>
              <p className="mt-2 text-slatecopy">{claim.entity_type} · {claim.entity_id}</p>
              <p className="mt-1 break-all text-muted">{claim.requester_name} · {claim.requester_email}</p>
              <p className="mt-2 text-xs text-muted">{dateLabel(claim.created_at)}</p>
            </article>
          )) : <p className="text-sm text-muted">No hay reclamaciones.</p>}
        </QueueSection>

        <QueueSection title="Solicitudes" count={requests.length} Icon={ClipboardCheck}>
          {requests.length ? requests.map((request) => (
            <article key={request.id} className="rounded-2xl border border-line bg-soft p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-ink">{request.target_id ?? "Sin ficha"}</strong><span className="chip">{request.status}</span></div>
              <p className="mt-2 text-slatecopy">{request.category_id ?? "Sin categoría"} · {request.municipality ?? "Sin municipio"}</p>
              <p className="mt-2 text-xs text-muted">{dateLabel(request.created_at)}</p>
            </article>
          )) : <p className="text-sm text-muted">No hay solicitudes.</p>}
        </QueueSection>

        <QueueSection title="Publicaciones y bajas" count={submissions.length} Icon={Inbox}>
          {submissions.length ? submissions.map((submission) => (
            <article key={submission.id} className="rounded-2xl border border-line bg-soft p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-ink">{submission.submission_type}</strong><span className="chip">{submission.status}</span></div>
              <p className="mt-2 text-xs text-muted">{dateLabel(submission.created_at)}</p>
            </article>
          )) : <p className="text-sm text-muted">No hay publicaciones ni bajas pendientes.</p>}
        </QueueSection>

        <QueueSection title="Avisos e incidencias" count={feedback.length} Icon={Flag}>
          {feedback.length ? feedback.map((item) => (
            <article key={item.id} className="rounded-2xl border border-line bg-soft p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-ink">{item.context ?? "Aviso general"}</strong><span className="chip">{item.status}</span></div>
              <p className="mt-2 text-slatecopy">{item.item_id ?? "Sin ficha asociada"}</p>
              {item.email ? <p className="mt-1 break-all text-muted">{item.name ? `${item.name} · ` : ""}{item.email}</p> : null}
              <p className="mt-2 text-xs text-muted">{dateLabel(item.created_at)}</p>
            </article>
          )) : <p className="text-sm text-muted">No hay avisos pendientes.</p>}
        </QueueSection>
      </div>
    </main>
  );
}
