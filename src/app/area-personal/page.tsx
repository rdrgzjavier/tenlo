import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, BriefcaseBusiness, ClipboardCheck, ClipboardList, FilePlus2, LayoutDashboard, Settings, ShieldCheck } from "lucide-react";
import PrivateAreaUnavailable from "@/components/PrivateAreaUnavailable";
import { ensurePendingBusinessProfile } from "@/lib/provider-registration";
import { acquisitionProfileFields } from "@/lib/profile-acquisition";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Área personal | Tenlo",
  description: "Gestiona favoritos, publicaciones, datos de cuenta y solicitudes dentro de Tenlo."
};

const accountActions = [
  {
    title: "Mis favoritos",
    text: "Guarda servicios, centros y recursos para compararlos más tarde.",
    href: "/favoritos",
    Icon: Bookmark
  },
  {
    title: "Mis solicitudes",
    text: "Consulta las peticiones de contacto que has enviado desde Tenlo.",
    href: "/solicitudes",
    Icon: ClipboardCheck
  },
  {
    title: "Mis publicaciones",
    text: "Revisa ofertas, recursos o fichas enviadas a Tenlo.",
    href: "/mis-publicaciones",
    Icon: ClipboardList
  },
  {
    title: "Publicar oferta",
    text: "Crea una nueva publicación para familias, servicios o centros.",
    href: "/publicar",
    Icon: FilePlus2
  },
  {
    title: "Datos de cuenta",
    text: "Consulta tus datos, cambia contraseña o solicita la baja.",
    href: "/datos-cuenta",
    Icon: Settings
  }
];

const providerProfileAction = {
  title: "Mi ficha profesional",
  text: "Completa la información que Tenlo revisará antes de publicarla.",
  href: "/mi-ficha-profesional",
  Icon: BriefcaseBusiness
};

function metadataName(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function metadataText(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim().slice(0, maxLength)
    : null;
}

const publicProfileRoles = new Set([
  "family", "school", "nursery", "shop", "sports_center", "activity_provider",
  "technology_provider", "transport_provider", "event_provider", "teacher",
  "childcare", "health_wellness", "camp_provider", "community_org"
]);

function metadataRole(value: unknown) {
  return typeof value === "string" && publicProfileRoles.has(value) ? value : "family";
}

function metadataStatus(role: string) {
  return role === "family" ? "approved" : "pending_review";
}

function normalizePublicName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

async function ensureProfile() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) redirect("/login?next=/area-personal");

  const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (existingProfile) {
    const metadataDisplayName = metadataName(user.user_metadata?.display_name);
    const emailFallback = user.email?.split("@")[0] ?? "";

    if (metadataDisplayName && (!existingProfile.public_name || existingProfile.public_name === emailFallback)) {
      const { data: updatedProfile } = await supabase
        .from("profiles")
        .update({
          display_name: metadataDisplayName,
          public_name: metadataDisplayName
        })
        .eq("id", user.id)
        .select("*")
        .maybeSingle();

      await supabase.from("profile_usernames").upsert(
        {
          profile_id: user.id,
          public_name_normalized: normalizePublicName(metadataDisplayName)
        },
        { onConflict: "profile_id" }
      );

      const activeProfile = updatedProfile ?? existingProfile;
      await ensurePendingBusinessProfile(
        supabase,
        user,
        activeProfile.role,
        activeProfile.display_name,
        activeProfile.phone,
        activeProfile.municipality
      );
      return { user, profile: activeProfile };
    }

    await ensurePendingBusinessProfile(
      supabase,
      user,
      existingProfile.role,
      existingProfile.display_name,
      existingProfile.phone,
      existingProfile.municipality
    );
    return { user, profile: existingProfile };
  }

  const role = metadataRole(user.user_metadata?.role);
  const fallbackName = metadataName(user.user_metadata?.display_name) ?? user.email?.split("@")[0] ?? "Usuario Tenlo";
  const phone = metadataText(user.user_metadata?.phone, 40);
  const municipality = metadataText(user.user_metadata?.municipality, 120);
  const relatedCenterName = metadataText(user.user_metadata?.related_center_name, 180);
  const marketingConsent = user.user_metadata?.marketing_consent === true;
  const marketingConsentAt = marketingConsent
    ? metadataText(user.user_metadata?.marketing_consent_at, 40) ?? new Date().toISOString()
    : null;
  const { data: profile } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      role,
      display_name: fallbackName,
      public_name: fallbackName,
      contact_email: user.email ?? null,
      phone,
      municipality,
      related_center_name: relatedCenterName,
      marketing_consent: marketingConsent,
      marketing_consent_at: marketingConsentAt,
      marketing_consent_source: marketingConsent ? "registration" : null,
      marketing_consent_withdrawn_at: null,
      ...acquisitionProfileFields(user),
      status: metadataStatus(role)
    })
    .select("*")
    .single();

  await supabase.from("profile_usernames").upsert(
    {
      profile_id: user.id,
      public_name_normalized: normalizePublicName(fallbackName)
    },
    { onConflict: "profile_id" }
  );

  if (profile) {
    await ensurePendingBusinessProfile(
      supabase,
      user,
      profile.role,
      profile.display_name,
      profile.phone,
      profile.municipality
    );
  }

  return { user, profile };
}

export default async function PersonalAreaPage() {
  if (!hasSupabaseServerConfig()) return <PrivateAreaUnavailable />;

  const { user, profile } = await ensureProfile();
  const reviewStatus = profile?.status === "approved" ? "Cuenta activa" : "Pendiente de revisión";
  const displayName = profile?.public_name ?? profile?.display_name ?? user.email?.split("@")[0] ?? "Tenlo";
  const visibleActions = profile?.role === "tenlo_admin"
    ? [...accountActions, { title: "Operación del piloto", text: "Revisa reclamaciones, solicitudes, publicaciones, bajas e incidencias.", href: "/admin", Icon: LayoutDashboard }]
    : profile?.role && profile.role !== "family"
      ? [providerProfileAction, ...accountActions]
      : accountActions;

  return (
    <div className="section-shell">
      <p className="label">Área personal</p>
      <h1 className="page-title">Hola, {displayName}</h1>
      <p className="lead max-w-5xl">El espacio donde podrás gestionar favoritos, publicaciones y datos de contacto de tu cuenta.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {visibleActions.map(({ title, text, href, Icon }) => (
          <Link key={title} href={href} className="card p-6 transition-colors hover:border-ink">
            <Icon size={28} className="text-ink" aria-hidden />
            <h2 className="mt-4 text-lg font-bold text-slatecopy">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 inline-flex max-w-full items-center gap-3 rounded-2xl border border-sage/30 bg-sage/10 px-4 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-petrol ring-1 ring-sage/25">
          <ShieldCheck size={20} aria-hidden />
        </span>
        <div>
          <p className="text-sm font-bold text-slatecopy">{reviewStatus}</p>
          <p className="text-sm leading-6 text-muted">Sesión iniciada como <strong>{displayName}</strong>.</p>
        </div>
      </div>
    </div>
  );
}
