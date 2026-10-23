import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PrivateAreaUnavailable from "@/components/PrivateAreaUnavailable";
import ProviderProfileEditor from "@/components/ProviderProfileEditor";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mi ficha profesional | Tenlo",
  description: "Completa la información profesional que Tenlo revisará antes de publicarla.",
  robots: { index: false, follow: false }
};

function recordValue(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export default async function ProviderProfilePage() {
  if (!hasSupabaseServerConfig()) return <PrivateAreaUnavailable />;

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=/mi-ficha-profesional");

  const { data: profiles, error } = await supabase
    .from("business_profiles")
    .select("id,business_name,website,address,municipality,service_area,category,subtype,description,phone,contact_email,details,status,latitude,longitude,location_visibility,service_municipalities,accepts_requests,contact_preferences,completeness_percent")
    .eq("owner_id", authData.user.id)
    .order("created_at", { ascending: false });

  const editableProfiles = (profiles ?? []).filter((profile) => ["draft", "pending_review", "rejected"].includes(profile.status));
  const publishedProfiles = (profiles ?? []).filter((profile) => profile.status === "approved");

  return (
    <div className="section-shell max-w-5xl">
      <p className="label">Área profesional</p>
      <h1 className="page-title">Mi ficha profesional</h1>
      <p className="lead max-w-4xl">Completa o corrige la información antes de que Tenlo la publique. La aprobación de la ficha y su nivel de confianza son procesos separados.</p>

      {error ? <p className="mt-6 rounded-2xl border border-coral/30 bg-coral/10 p-4 text-sm font-semibold text-coral">No hemos podido cargar tu ficha profesional.</p> : null}
      <div className="mt-8 grid gap-5">
        {editableProfiles.map((profile) => <ProviderProfileEditor key={profile.id} profile={{ ...profile, details: recordValue(profile.details) }} />)}
        {publishedProfiles.map((profile) => (
          <section key={profile.id} className="card p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-ink">{profile.business_name}</h2><p className="mt-1 text-sm text-muted">Ficha aprobada</p></div><span className="chip">Publicada</span></div>
            <p className="mt-4 text-sm leading-6 text-slatecopy">Para proteger la calidad del directorio, los cambios de una ficha aprobada pasan por una nueva revisión.</p>
            <Link href="/feedback" className="btn-secondary mt-5 w-fit">Solicitar una corrección</Link>
          </section>
        ))}
        {!error && !profiles?.length ? (
          <section className="card p-6 text-center"><h2 className="text-xl font-bold text-ink">Todavía no tienes una ficha vinculada</h2><p className="mt-2 text-sm leading-6 text-muted">Busca la ficha existente de tu entidad o crea una cuenta profesional desde el registro para iniciar la revisión.</p><Link href="/servicios" className="btn-primary mt-5 w-fit">Buscar mi ficha</Link></section>
        ) : null}
      </div>
    </div>
  );
}
