import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { listings } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mis solicitudes | Tenlo",
  description: "Consulta el estado de las solicitudes enviadas desde Tenlo."
};

const statusLabels: Record<string, string> = {
  submitted: "Enviada",
  delivered: "Entregada",
  viewed: "Vista por el proveedor",
  responded: "Respondida",
  declined: "Sin disponibilidad",
  alternative_requested: "Alternativa solicitada",
  alternative_offered: "Alternativa disponible",
  closed: "Cerrada"
};

export default async function RequestsPage() {
  const supabase = createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=/solicitudes");

  const { data: requests } = await supabase
    .from("connection_requests")
    .select("id,target_id,category_id,municipality,status,created_at")
    .eq("family_id", authData.user.id)
    .order("created_at", { ascending: false });
  const hasRequests = Boolean(requests?.length);

  return (
    <main className="section-shell">
      <p className="label">Área personal</p>
      <h1 className="page-title">Mis solicitudes</h1>
      <p className="lead max-w-4xl">Aquí podrás seguir el estado de los contactos iniciados dentro de Tenlo.</p>
      {hasRequests ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {requests?.map((request) => {
            const listing = listings.find((item) => item.id === request.target_id);
            return (
              <article key={request.id} className="card p-5">
                <span className="chip">{statusLabels[request.status] ?? request.status}</span>
                <h2 className="mt-4 text-lg font-bold text-slatecopy">{listing?.title ?? "Solicitud de información"}</h2>
                <p className="mt-2 text-sm text-muted">{request.municipality ?? listing?.municipality ?? "Zona pendiente"}</p>
                <p className="mt-3 text-xs text-muted">Enviada el {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(request.created_at))}</p>
                {listing ? <Link href={`/anuncios/${listing.slug}`} className="btn-secondary mt-5 w-full">Ver ficha</Link> : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 max-w-2xl rounded-[24px] border border-line bg-panel p-8 text-center shadow-soft">
          <ClipboardCheck className="mx-auto text-ink" size={32} aria-hidden />
          <h2 className="mt-4 text-2xl font-bold text-slatecopy">Todavía no tienes solicitudes</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Cuando contactes con un centro o servicio desde su ficha, podrás seguirlo aquí.</p>
          <Link href="/buscar" className="btn-primary mt-6">Buscar opciones</Link>
        </div>
      )}
    </main>
  );
}
