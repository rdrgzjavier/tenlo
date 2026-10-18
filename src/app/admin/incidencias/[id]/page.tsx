import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, Mail, UserRound } from "lucide-react";
import AdminStatusControl from "@/components/AdminStatusControl";
import AdminNotes from "@/components/AdminNotes";
import PrivateAreaUnavailable from "@/components/PrivateAreaUnavailable";
import { feedbackContextParts, feedbackTargetHref, moderationStatusLabel } from "@/lib/adminFeedback";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Revisar incidencia | Tenlo",
  robots: { index: false, follow: false }
};

function dateLabel(value?: string | null) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeStyle: "short" }).format(new Date(value));
}

export default async function FeedbackReviewPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabaseServerConfig()) return <PrivateAreaUnavailable />;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect(`/login?next=/admin/incidencias/${encodeURIComponent(id)}`);

  const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", authData.user.id).maybeSingle();
  if (profile?.role !== "tenlo_admin" || profile.status !== "approved") redirect("/area-personal");

  const { data: item, error } = await supabase
    .from("feedback_requests")
    .select("id,user_id,context,item_id,name,email,message,status,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !item) notFound();

  const { data: notes } = await supabase
    .from("admin_queue_notes")
    .select("id,note,created_at")
    .eq("queue", "feedback")
    .eq("record_id", id)
    .order("created_at", { ascending: false });

  const context = feedbackContextParts(item.context);
  const targetHref = feedbackTargetHref(item.context, item.item_id);

  return (
    <main className="section-shell max-w-4xl">
      <Link href="/admin" className="inline-flex min-h-11 items-center gap-2 font-bold text-ink">
        <ArrowLeft size={18} aria-hidden /> Volver a operación
      </Link>
      <p className="label mt-5">Revisión administrativa</p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <h1 className="page-title mt-0">{context.title}</h1>
        <span className="chip">{moderationStatusLabel(item.status)}</span>
      </div>
      <p className="lead max-w-3xl">Lee la solicitud completa, comprueba la referencia y deja registrado el resultado de la revisión.</p>

      <section className="card mt-8 p-5 md:p-7">
        <h2 className="subsection-title text-ink">Mensaje recibido</h2>
        <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-line bg-soft p-4 leading-7 text-slatecopy">{item.message}</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line p-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-muted">Tipo</dt>
            <dd className="mt-1 font-bold text-ink">{context.category}</dd>
            {context.requestTypeLabel ? <dd className="mt-1 text-sm text-slatecopy">{context.requestTypeLabel}</dd> : null}
          </div>
          <div className="rounded-2xl border border-line p-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-muted">Fecha de recepción</dt>
            <dd className="mt-1 font-bold text-ink">{dateLabel(item.created_at)}</dd>
          </div>
          <div className="rounded-2xl border border-line p-4 sm:col-span-2">
            <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted"><UserRound size={16} aria-hidden /> Persona de contacto</dt>
            <dd className="mt-2 font-bold text-ink">{item.name || "Nombre no indicado"}</dd>
            {item.email ? <dd className="mt-1"><a className="inline-flex items-center gap-2 break-all font-semibold text-ink underline" href={`mailto:${item.email}`}><Mail size={16} aria-hidden />{item.email}</a></dd> : <dd className="mt-1 text-sm text-muted">Email no indicado</dd>}
          </div>
          <div className="rounded-2xl border border-line p-4 sm:col-span-2">
            <dt className="text-xs font-bold uppercase tracking-wide text-muted">Ficha o referencia relacionada</dt>
            <dd className="mt-1 break-all font-bold text-ink">{item.item_id || "No hay una ficha asociada"}</dd>
            {targetHref ? <dd className="mt-3"><Link href={targetHref} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-4 py-2 font-bold text-ink hover:border-ink" target="_blank" rel="noreferrer">Abrir ficha relacionada <ExternalLink size={16} aria-hidden /></Link></dd> : null}
          </div>
        </dl>

        <div className="mt-6 rounded-2xl border border-line bg-soft p-4 text-sm leading-6 text-slatecopy">
          <strong className="text-ink">Qué hacer ahora</strong>
          <p className="mt-1">Comprueba el mensaje y la ficha relacionada. Si necesitas aclaraciones, responde al email. Después marca la incidencia como Resuelta, Descartada o Archivada.</p>
        </div>

        <AdminNotes queue="feedback" recordId={item.id} notes={notes ?? []} />
        <AdminStatusControl queue="feedback" recordId={item.id} currentStatus={item.status} />
        <details className="mt-5 rounded-xl border border-line p-4 text-xs text-muted">
          <summary className="cursor-pointer font-bold text-ink">Ver datos técnicos</summary>
          <dl className="mt-3 grid gap-1">
            <div><dt className="inline font-bold">ID: </dt><dd className="inline break-all">{item.id}</dd></div>
            <div><dt className="inline font-bold">Usuario: </dt><dd className="inline break-all">{item.user_id || "No autenticado"}</dd></div>
            <div><dt className="inline font-bold">Código de contexto: </dt><dd className="inline break-all">{item.context || "general"}</dd></div>
            <div><dt className="inline font-bold">Última actualización: </dt><dd className="inline">{dateLabel(item.updated_at)}</dd></div>
          </dl>
        </details>
      </section>
    </main>
  );
}
