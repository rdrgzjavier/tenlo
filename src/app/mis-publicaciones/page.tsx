import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import PrivateAreaUnavailable from "@/components/PrivateAreaUnavailable";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

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
  if (!hasSupabaseServerConfig()) return <PrivateAreaUnavailable />;

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) redirect("/login?next=/mis-publicaciones");

  const [{ data: submissions }, { data: businessProfiles }] = await Promise.all([
    supabase
      .from("submissions")
      .select("id,submission_type,status,review_notes,created_at,payload")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("business_profiles")
      .select("id,business_name,category,subtype,municipality,service_area,description,status,trust_level,created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
  ]);

  const hasSubmissions = Boolean(submissions?.length || businessProfiles?.length);

  return (
    <div className="section-shell">
      {hasSubmissions ? (
        <>
          <p className="label">Área personal</p>
          <h1 className="page-title">Mis publicaciones</h1>
          <p className="lead max-w-4xl">Aquí puedes revisar el estado de las ofertas, recursos o fichas que has enviado a Tenlo.</p>

          <div className="mt-8 grid gap-4">
            {businessProfiles?.map((businessProfile) => (
              <article key={businessProfile.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="chip">{statusLabel(businessProfile.status)}</span>
                    <h2 className="mt-4 text-xl font-bold text-slatecopy">{businessProfile.business_name}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">Ficha profesional · {businessProfile.category}{businessProfile.subtype ? ` · ${businessProfile.subtype}` : ""}</p>
                  </div>
                  <span className="chip">{businessProfile.trust_level === "collected" ? "No verificada" : businessProfile.trust_level}</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slatecopy">{businessProfile.description || "La descripción está pendiente de completar."}</p>
                <p className="mt-3 text-sm text-muted">{businessProfile.service_area || businessProfile.municipality || "Zona pendiente"}</p>
                {businessProfile.status === "pending_review" ? <p className="mt-4 rounded-2xl border border-sage/30 bg-sage/10 p-4 text-sm leading-6 text-slatecopy">Tenlo está revisando esta información. El plazo operativo del piloto es de hasta cuatro días laborables.</p> : null}
                {businessProfile.status === "rejected" ? <p className="mt-4 rounded-2xl border border-coral/30 bg-coral/10 p-4 text-sm leading-6 text-slatecopy">La ficha necesita cambios antes de volver a revisarse. Responde al email de Tenlo o contacta con el equipo para aportar la información necesaria.</p> : null}
              </article>
            ))}
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
          <h1 className="detail-title mt-5">Mis publicaciones</h1>
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
