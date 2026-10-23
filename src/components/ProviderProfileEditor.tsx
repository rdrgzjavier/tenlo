"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { municipalities } from "@/lib/mock-data";
import { pushTrackingEvent } from "@/lib/analytics";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ProviderProfileEditorProps = {
  profile: {
    id: string;
    business_name: string;
    website: string | null;
    municipality: string | null;
    service_area: string | null;
    category: string;
    subtype: string | null;
    description: string | null;
    phone: string | null;
    contact_email: string | null;
    details: Record<string, unknown>;
    status: string;
  };
};

function detailText(details: Record<string, unknown>, key: string) {
  const value = details[key];
  return typeof value === "string" ? value : "";
}

export default function ProviderProfileEditor({ profile }: ProviderProfileEditorProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [businessName, setBusinessName] = useState(profile.business_name);
  const [website, setWebsite] = useState(profile.website ?? "");
  const [municipality, setMunicipality] = useState(profile.municipality ?? "");
  const [serviceArea, setServiceArea] = useState(profile.service_area ?? "");
  const [category, setCategory] = useState(profile.category);
  const [subtype, setSubtype] = useState(profile.subtype ?? "");
  const [description, setDescription] = useState(profile.description ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [contactEmail, setContactEmail] = useState(profile.contact_email ?? "");
  const [modality, setModality] = useState(detailText(profile.details, "modality"));
  const [ageRange, setAgeRange] = useState(detailText(profile.details, "age_range"));
  const [availability, setAvailability] = useState(detailText(profile.details, "availability"));
  const [schedule, setSchedule] = useState(detailText(profile.details, "schedule"));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setLoading(false);
      setError("No hemos podido confirmar tu sesión.");
      return;
    }

    const details = {
      ...profile.details,
      modality: modality.trim(),
      age_range: ageRange.trim(),
      availability: availability.trim(),
      schedule: schedule.trim()
    };

    const { data: updatedProfile, error: updateError } = await supabase
      .from("business_profiles")
      .update({
        business_name: businessName.trim(),
        website: website.trim() || null,
        municipality: municipality || null,
        service_area: serviceArea.trim() || municipality || null,
        category: category.trim(),
        subtype: subtype.trim() || null,
        description: description.trim(),
        phone: phone.trim() || null,
        contact_email: contactEmail.trim() || null,
        details,
        service_municipalities: municipality ? [municipality] : []
      })
      .eq("id", profile.id)
      .eq("owner_id", authData.user.id)
      .select("id")
      .maybeSingle();

    if (updateError || !updatedProfile) {
      setLoading(false);
      setError("No hemos podido guardar los cambios. La ficha puede estar publicada o pendiente de una revisión distinta.");
      return;
    }

    if (profile.status === "rejected") {
      const { data: resubmitted, error: resubmitError } = await supabase.rpc("resubmit_business_profile", { target_id: profile.id });
      if (resubmitError || !resubmitted) {
        setLoading(false);
        setError("Los cambios se guardaron, pero no pudimos reenviar la ficha a revisión. Contacta con Tenlo.");
        return;
      }
    }

    pushTrackingEvent("profile_section_completed", { section: "business_profile", status_before: profile.status });
    pushTrackingEvent("profile_submitted", { entity_type: "provider", submission_mode: profile.status === "rejected" ? "resubmission" : "update" });
    setLoading(false);
    setMessage(profile.status === "rejected" ? "Cambios guardados y ficha reenviada a revisión." : "Cambios guardados. La ficha continúa pendiente de revisión.");
    router.refresh();
  }

  return (
    <form className="card grid gap-5 p-5 md:p-6" onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">{profile.business_name}</h2>
          <p className="mt-1 text-sm text-muted">{profile.status === "rejected" ? "Necesita cambios" : "Pendiente de revisión"}</p>
        </div>
        <span className="chip">No verificada</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="field-label">Nombre profesional<input required maxLength={180} className="field font-normal" value={businessName} onChange={(event) => setBusinessName(event.target.value)} /></label>
        <label className="field-label">Web pública<input type="url" maxLength={500} className="field font-normal" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://" /></label>
        <label className="field-label">Municipio principal<select required className="field" value={municipality} onChange={(event) => setMunicipality(event.target.value)}><option value="" disabled>Selecciona municipio</option>{municipalities.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
        <label className="field-label">Zona de servicio<input maxLength={500} className="field font-normal" value={serviceArea} onChange={(event) => setServiceArea(event.target.value)} placeholder="Ej. Majadahonda y alrededores" /></label>
        <label className="field-label">Categoría<input required maxLength={120} className="field font-normal" value={category} onChange={(event) => setCategory(event.target.value)} /></label>
        <label className="field-label">Especialidad<input maxLength={120} className="field font-normal" value={subtype} onChange={(event) => setSubtype(event.target.value)} /></label>
        <label className="field-label md:col-span-2">Descripción<textarea required minLength={20} maxLength={2000} className="field min-h-32 py-3 font-normal" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <label className="field-label">Email profesional<input type="email" maxLength={180} className="field font-normal" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} /></label>
        <label className="field-label">Teléfono profesional<input type="tel" maxLength={40} className="field font-normal" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
        <label className="field-label">Modalidad<input maxLength={120} className="field font-normal" value={modality} onChange={(event) => setModality(event.target.value)} placeholder="Presencial, online, a domicilio…" /></label>
        <label className="field-label">Edades orientativas<input maxLength={160} className="field font-normal" value={ageRange} onChange={(event) => setAgeRange(event.target.value)} /></label>
        <label className="field-label">Disponibilidad<input maxLength={300} className="field font-normal" value={availability} onChange={(event) => setAvailability(event.target.value)} /></label>
        <label className="field-label">Horarios o franjas<input maxLength={1000} className="field font-normal" value={schedule} onChange={(event) => setSchedule(event.target.value)} /></label>
      </div>

      <p className="rounded-2xl border border-line bg-soft p-4 text-sm leading-6 text-slatecopy">Los cambios seguirán siendo privados hasta que Tenlo complete la revisión. No incluyas nombres, horarios ni otros datos identificativos de menores.</p>
      {error ? <p className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral" role="alert">{error}</p> : null}
      {message ? <p className="rounded-xl border border-sage/30 bg-sage/10 p-3 text-sm font-semibold text-petrol" role="status">{message}</p> : null}
      <button className="btn-primary w-full justify-center md:w-fit" disabled={loading}>{loading ? "Guardando…" : profile.status === "rejected" ? "Guardar y reenviar" : "Guardar cambios"}</button>
    </form>
  );
}
