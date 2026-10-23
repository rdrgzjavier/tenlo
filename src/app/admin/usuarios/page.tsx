import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserCheck, UsersRound } from "lucide-react";
import PrivateAreaUnavailable from "@/components/PrivateAreaUnavailable";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Usuarios y consentimiento | Tenlo",
  robots: { index: false, follow: false }
};

type RankedItem = { label: string; count: number };

function rank(values: Array<string | null | undefined>, fallback: string) {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    const label = value?.trim() || fallback;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"))
    .slice(0, 10);
}

function RankingTable({ title, description, items }: { title: string; description: string; items: RankedItem[] }) {
  return (
    <section className="card p-5 md:p-6">
      <h2 className="subsection-title text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      {items.length ? <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-line text-xs uppercase tracking-wide text-muted"><th className="pb-3 pr-4">Segmento</th><th className="pb-3 text-right">Usuarios</th></tr></thead><tbody>{items.map((item) => <tr key={item.label} className="border-b border-line/70 last:border-0"><td className="py-3 pr-4 font-semibold text-ink">{item.label}</td><td className="py-3 text-right tabular-nums text-slatecopy">{item.count}</td></tr>)}</tbody></table></div> : <p className="mt-5 text-sm text-muted">Sin datos todavía.</p>}
    </section>
  );
}

function percentage(part: number, total: number) {
  return total ? `${Math.round((part / total) * 100)} %` : "Sin datos";
}

const roleLabels: Record<string, string> = {
  family: "Familia",
  school: "Centro educativo",
  nursery: "Escuela infantil",
  shop: "Comercio o servicio",
  sports_center: "Centro deportivo",
  activity_provider: "Actividades",
  technology_provider: "Tecnología",
  transport_provider: "Transporte",
  event_provider: "Eventos",
  teacher: "Profesional independiente",
  childcare: "Cuidado infantil",
  health_wellness: "Salud y bienestar",
  camp_provider: "Campamentos",
  community_org: "Entidad comunitaria",
  tenlo_admin: "Administración"
};

const onboardingLabels: Record<string, string> = {
  registered: "Registrado",
  email_confirmed: "Email confirmado",
  profile_started: "Perfil iniciado",
  profile_complete: "Perfil completo",
  active: "Activo"
};

export default async function AdminUsersPage() {
  if (!hasSupabaseServerConfig()) return <PrivateAreaUnavailable />;

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=/admin/usuarios");

  const { data: adminProfile } = await supabase.from("profiles").select("role,status").eq("id", authData.user.id).maybeSingle();
  if (adminProfile?.role !== "tenlo_admin" || adminProfile.status !== "approved") redirect("/area-personal");

  const [profilesResult, consentResult] = await Promise.all([
    supabase.from("profiles").select("role,municipality,marketing_consent,registration_channel,acquisition_entry_channel,acquisition_source,acquisition_medium,acquisition_campaign,onboarding_status,created_at").order("created_at", { ascending: false }).limit(5000),
    supabase.from("consent_history").select("decision,recorded_at").eq("purpose", "marketing_email").order("recorded_at", { ascending: false }).limit(5000)
  ]);

  const profiles = profilesResult.data ?? [];
  const consentEvents = consentResult.data ?? [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const recentProfiles = profiles.filter((profile) => new Date(profile.created_at) >= cutoff);
  const marketingActive = profiles.filter((profile) => profile.marketing_consent).length;
  const providerProfiles = profiles.filter((profile) => !["family", "tenlo_admin"].includes(profile.role)).length;
  const recentConsentEvents = consentEvents.filter((event) => new Date(event.recorded_at) >= cutoff);
  const recentGranted = recentConsentEvents.filter((event) => event.decision === "granted").length;
  const recentWithdrawn = recentConsentEvents.filter((event) => event.decision === "withdrawn").length;
  const campaigns = rank(profiles.map((profile) => profile.acquisition_campaign ? `${profile.acquisition_source || "sin fuente"} · ${profile.acquisition_campaign}` : null), "Sin campaña identificada");

  return (
    <main className="section-shell">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-ink underline"><ArrowLeft size={16} aria-hidden />Volver a operación</Link>
      <p className="label mt-6">Informe privado</p>
      <h1 className="page-title">Usuarios y consentimiento</h1>
      <p className="lead max-w-4xl">Lectura agregada de registros, activación y procedencia. No muestra nombres, emails, teléfonos ni textos libres.</p>

      {profilesResult.error || consentResult.error ? <p className="mt-6 rounded-2xl border border-coral/30 bg-coral/10 p-4 text-sm font-semibold text-coral">No se ha podido cargar una parte del informe. Comprueba las migraciones y permisos.</p> : null}

      <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de usuarios">
        <div className="card p-5"><UsersRound className="text-primary" size={22} aria-hidden /><p className="mt-3 text-sm font-semibold text-muted">Cuentas totales</p><p className="mt-1 text-3xl font-black text-ink">{profiles.length}</p></div>
        <div className="card p-5"><UserCheck className="text-primary" size={22} aria-hidden /><p className="mt-3 text-sm font-semibold text-muted">Altas en 30 días</p><p className="mt-1 text-3xl font-black text-ink">{recentProfiles.length}</p></div>
        <div className="card p-5"><ShieldCheck className="text-primary" size={22} aria-hidden /><p className="mt-3 text-sm font-semibold text-muted">Marketing activo</p><p className="mt-1 text-3xl font-black text-ink">{marketingActive}</p><p className="mt-1 text-xs text-muted">{percentage(marketingActive, profiles.length)} del total</p></div>
        <div className="card p-5"><UsersRound className="text-primary" size={22} aria-hidden /><p className="mt-3 text-sm font-semibold text-muted">Cuentas proveedoras</p><p className="mt-1 text-3xl font-black text-ink">{providerProfiles}</p><p className="mt-1 text-xs text-muted">Excluye familias y administración</p></div>
      </section>

      <section className="card mt-5 p-5 md:p-6">
        <h2 className="subsection-title text-ink">Cambios de consentimiento en 30 días</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-line bg-soft p-4"><p className="text-sm text-muted">Concesiones registradas</p><p className="mt-1 text-2xl font-black text-ink">{recentGranted}</p></div><div className="rounded-2xl border border-line bg-soft p-4"><p className="text-sm text-muted">Retiradas registradas</p><p className="mt-1 text-2xl font-black text-ink">{recentWithdrawn}</p></div></div>
        <p className="mt-4 text-xs leading-5 text-muted">Son eventos, no usuarios únicos. Nunca deben sumarse para calcular la base activable; esa base es el estado actual mostrado arriba.</p>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <RankingTable title="Tipo de cuenta" description="Distribución de la oferta y la demanda registradas." items={rank(profiles.map((profile) => roleLabels[profile.role] || profile.role), "Sin tipo")} />
        <RankingTable title="Estado de onboarding" description="Fase operativa distinta del estado de moderación." items={rank(profiles.map((profile) => onboardingLabels[profile.onboarding_status] || profile.onboarding_status), "Sin estado")} />
        <RankingTable title="Canal de registro" description="Canal técnico utilizado para crear la cuenta." items={rank(profiles.map((profile) => profile.registration_channel), "Desconocido")} />
        <RankingTable title="Canal de entrada" description="Atribución propia saneada al inicio de la sesión de registro." items={rank(profiles.map((profile) => profile.acquisition_entry_channel), "Sin atribución")} />
        <RankingTable title="Municipio declarado" description="Zona general indicada por la persona, nunca una dirección familiar." items={rank(profiles.map((profile) => profile.municipality), "No indicado")} />
        <RankingTable title="Campañas de adquisición" description="Fuente y campaña asociadas al alta. Sin campaña no significa necesariamente tráfico directo." items={campaigns} />
      </div>

      <p className="mt-6 rounded-2xl border border-line bg-soft p-4 text-sm leading-6 text-slatecopy">No uses estos datos para enviar campañas hasta confirmar la base jurídica, excluir bajas, rebotes y quejas, y filtrar por consentimiento de marketing activo.</p>
    </main>
  );
}
