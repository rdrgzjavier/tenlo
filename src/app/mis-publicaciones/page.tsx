import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mis publicaciones | Tenlo",
  description: "Ofertas, recursos y fichas enviadas a revisión desde tu cuenta de Tenlo."
};

function statusLabel(status: string) {
  if (status === "approved") return "Aprobada";
  if (status === "rejected") return "No aprobada";
  if (status === "needs_changes") return "Necesita cambios";
  return "Pendiente de revisión";
}

export default async function MyPublicationsPage() {
  const supabase = createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) redirect("/login?next=/mis-publicaciones");

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id,submission_type,status,review_notes,created_at,payload")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const hasSubmissions = Boolean(submissions?.length);

  return (
    <div className="section-shell">
      {hasSubmissions ? (
        <>
          <p className="label">Área personal</p>
          <h1 className="page-title">Mis publicaciones</h1>
          <p className="lead max-w-4xl">Aquí puedes revisar el estado de las ofertas, recursos o fichas que has enviado a Tenlo.</p>

          <div className="mt-8 grid gap-4">
            {submissions?.map((submission) => {
              const payload = typeof submission.payload === "object" && submission.payload !== null ? submission.payload as Record<string, unknown> : {};
              const title = typeof payload.title === "string" ? payload.title : "Publicación enviada";

              return (
                <article key={submission.id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="chip">{statusLabel(submission.status)}</span>
                      <h2 className="mt-4 text-xl font-bold text-slatecopy">{title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted">Tipo: {submission.submission_type}</p>
                    </div>
                    <Link href="/publicar" className="btn-secondary">Publicar otra oferta</Link>
                  </div>
                  {submission.review_notes ? (
                    <p className="mt-4 rounded-2xl bg-soft p-4 text-sm leading-6 text-muted">{submission.review_notes}</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-2xl rounded-[24px] border border-line bg-panel p-8 text-center shadow-soft">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lavender text-ink">
            <ClipboardList size={24} aria-hidden />
          </span>
          <h1 className="mt-5 text-3xl font-bold text-slatecopy">Mis publicaciones</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Aquí aparecerán las ofertas, recursos o fichas que envíes a Tenlo para revisión.
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/publicar" className="btn-primary">Publicar oferta</Link>
          </div>
        </div>
      )}
    </div>
  );
}
