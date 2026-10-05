import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccountSettings from "@/components/AccountSettings";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Datos de cuenta | Tenlo",
  description: "Consulta datos de cuenta, cambia contraseña o solicita la baja en Tenlo."
};

function metadataName(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizePublicName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export default async function AccountDataPage() {
  const supabase = createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) redirect("/login?next=/datos-cuenta");

  let { data: profile } = await supabase
    .from("profiles")
    .select("display_name,public_name,contact_email,role,status,municipality")
    .eq("id", user.id)
    .maybeSingle();

  const metadataDisplayName = metadataName(user.user_metadata?.display_name);
  const emailFallback = user.email?.split("@")[0] ?? "";

  if (profile && metadataDisplayName && (!profile.public_name || profile.public_name === emailFallback)) {
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .update({
        display_name: metadataDisplayName,
        public_name: metadataDisplayName
      })
      .eq("id", user.id)
      .select("display_name,public_name,contact_email,role,status,municipality")
      .maybeSingle();

    profile = updatedProfile ?? profile;

    await supabase.from("profile_usernames").upsert(
      {
        profile_id: user.id,
        public_name_normalized: normalizePublicName(metadataDisplayName)
      },
      { onConflict: "profile_id" }
    );
  }

  const displayName = profile?.public_name ?? profile?.display_name ?? user.email?.split("@")[0] ?? "Usuario Tenlo";

  return (
    <div className="section-shell">
      <p className="label">Área personal</p>
      <h1 className="page-title">Datos de cuenta</h1>
      <p className="lead max-w-4xl">Consulta tus datos principales, cambia tu contraseña o solicita la baja de la cuenta.</p>

      <div className="mt-8">
        <AccountSettings
          email={profile?.contact_email ?? user.email ?? ""}
          displayName={displayName}
          role={profile?.role ?? "family"}
          status={profile?.status ?? "approved"}
          municipality={profile?.municipality}
        />
      </div>
    </div>
  );
}
