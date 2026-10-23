"use client";

import { type FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { municipalities } from "@/lib/mock-data";
import { pushTrackingEvent } from "@/lib/analytics";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ProviderProfileEditorProps = {
  profile: {
    id: string;
    business_name: string;
    website: string | null;
    address: string | null;
    municipality: string | null;
    service_area: string | null;
    category: string;
    subtype: string | null;
    description: string | null;
    phone: string | null;
    contact_email: string | null;
    details: Record<string, unknown>;
    status: string;
    latitude: number | null;
    longitude: number | null;
    location_visibility: string;
    service_municipalities: string[];
    accepts_requests: boolean;
    contact_preferences: string[];
    completeness_percent: number;
  };
};

function detailText(details: Record<string, unknown>, key: string) {
  const value = details[key];
  return typeof value === "string" ? value : "";
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

const contactOptions = [
  { id: "tenlo", label: "Solicitud dentro de Tenlo" },
  { id: "phone", label: "Llamada" },
  { id: "email", label: "Email" },
  { id: "website", label: "Web oficial" }
];

export default function ProviderProfileEditor({ profile }: ProviderProfileEditorProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [businessName, setBusinessName] = useState(profile.business_name);
  const [website, setWebsite] = useState(profile.website ?? "");
  const [address, setAddress] = useState(profile.address ?? "");
  const [municipality, setMunicipality] = useState(profile.municipality ?? "");
  const [serviceMunicipalities, setServiceMunicipalities] = useState(profile.service_municipalities ?? []);
  const [locationVisibility, setLocationVisibility] = useState(profile.location_visibility || "service_area");
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
  const [verificationInfo, setVerificationInfo] = useState(detailText(profile.details, "verification_info"));
  const [acceptsRequests, setAcceptsRequests] = useState(profile.accepts_requests);
  const [contactPreferences, setContactPreferences] = useState(profile.contact_preferences ?? []);
  const [relationshipConfirmed, setRelationshipConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const editStarted = useRef(false);

  const completeness = useMemo(() => {
    const hasDetails = [modality, ageRange, availability, schedule, verificationInfo].some((value) => value.trim());
    return (
      (businessName.trim() ? 15 : 0) +
      (category.trim() ? 15 : 0) +
      (description.trim() ? 20 : 0) +
      (municipality ? 10 : 0) +
      (serviceArea.trim() || serviceMunicipalities.length ? 10 : 0) +
      (contactEmail.trim() || phone.trim() ? 10 : 0) +
      (website.trim() ? 5 : 0) +
      (subtype.trim() ? 5 : 0) +
      (hasDetails ? 10 : 0)
    );
  }, [ageRange, availability, businessName, category, contactEmail, description, modality, municipality, phone, schedule, serviceArea, serviceMunicipalities.length, subtype, verificationInfo, website]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    if (!relationshipConfirmed) {
      setLoading(false);
      setError("Confirma tu relación con la entidad antes de enviar la ficha.");
      return;
    }
    if (!serviceMunicipalities.length) {
      setLoading(false);
      setError("Selecciona al menos un municipio en el que prestas el servicio.");
      return;
    }
    if (locationVisibility === "exact" && !address.trim()) {
      setLoading(false);
      setError("La dirección es necesaria para mostrar una ubicación exacta.");
      return;
    }
    const validContactPreferences = contactPreferences.filter((preference) => (
      preference === "tenlo" ||
      (preference === "phone" && phone.trim()) ||
      (preference === "email" && contactEmail.trim()) ||
      (preference === "website" && website.trim())
    ));
    if (acceptsRequests && !validContactPreferences.length) {
      setLoading(false);
      setError("Indica al menos una vía de contacto si aceptas solicitudes.");
      return;
    }

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
      schedule: schedule.trim(),
      verification_info: verificationInfo.trim(),
      relationship_confirmed: true,
      relationship_confirmation_at: new Date().toISOString()
    };

    const { data: updatedProfile, error: updateError } = await supabase
      .from("business_profiles")
      .update({
        business_name: businessName.trim(),
        website: website.trim() || null,
        address: address.trim() || null,
        municipality: municipality || null,
        service_area: serviceArea.trim() || municipality || null,
        category: category.trim(),
        subtype: subtype.trim() || null,
        description: description.trim(),
        phone: phone.trim() || null,
        contact_email: contactEmail.trim() || null,
        details,
        service_municipalities: serviceMunicipalities,
        location_visibility: locationVisibility,
        accepts_requests: acceptsRequests,
        contact_preferences: acceptsRequests ? validContactPreferences : []
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
    <form className="card grid gap-6 p-5 md:p-6" onSubmit={handleSubmit} onFocusCapture={() => { if (!editStarted.current) { editStarted.current = true; pushTrackingEvent("profile_edit_started", { entity_type: "provider", status: profile.status }); } }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">{profile.business_name}</h2>
          <p className="mt-1 text-sm text-muted">{profile.status === "rejected" ? "Necesita cambios" : "Pendiente de revisión"}</p>
        </div>
        <div className="text-right"><span className="chip">No verificada</span><p className="mt-2 text-xs font-semibold text-muted">Ficha completa al {completeness}%</p></div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-soft" aria-label={`Ficha completa al ${completeness}%`}><span className="block h-full rounded-full bg-primary transition-all" style={{ width: `${completeness}%` }} /></div>

      <fieldset className="grid gap-4 rounded-2xl border border-line p-4 md:grid-cols-2">
        <legend className="px-2 text-sm font-bold text-primary">1. Relación e identidad</legend>
        <label className="field-label">Nombre profesional<input required maxLength={180} className="field font-normal" value={businessName} onChange={(event) => setBusinessName(event.target.value)} /></label>
        <label className="field-label">Web pública<input type="url" maxLength={500} className="field font-normal" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://" /></label>
        <label className="field-label">Categoría<input required maxLength={120} className="field font-normal" value={category} onChange={(event) => setCategory(event.target.value)} /></label>
        <label className="field-label">Especialidad<input maxLength={120} className="field font-normal" value={subtype} onChange={(event) => setSubtype(event.target.value)} /></label>
        <label className="field-label md:col-span-2">Descripción<textarea required minLength={20} maxLength={2000} className="field min-h-32 py-3 font-normal" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <label className="md:col-span-2 flex items-start gap-3 rounded-xl bg-soft p-4 text-sm leading-6 text-slatecopy"><input type="checkbox" className="mt-1 h-4 w-4 accent-primary" checked={relationshipConfirmed} onChange={(event) => setRelationshipConfirmed(event.target.checked)} /><span>Confirmo que represento a esta entidad o estoy autorizado para mantener esta información profesional.</span></label>
      </fieldset>

      <fieldset className="grid gap-4 rounded-2xl border border-line p-4 md:grid-cols-2">
        <legend className="px-2 text-sm font-bold text-primary">2. Servicios y zona</legend>
        <label className="field-label">Municipio principal<select required className="field" value={municipality} onChange={(event) => { const value = event.target.value; setMunicipality(value); if (value && !serviceMunicipalities.includes(value)) setServiceMunicipalities([...serviceMunicipalities, value]); }}><option value="" disabled>Selecciona municipio</option>{municipalities.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
        <label className="field-label">Zona de servicio<input maxLength={500} className="field font-normal" value={serviceArea} onChange={(event) => setServiceArea(event.target.value)} placeholder="Ej. Madrid noroeste y online" /></label>
        <div className="md:col-span-2"><p className="field-label">Municipios donde prestas servicio</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{municipalities.map((item) => <label key={item.id} className="flex items-center gap-3 rounded-xl border border-line p-3 text-sm font-semibold text-ink"><input type="checkbox" className="h-4 w-4 accent-primary" checked={serviceMunicipalities.includes(item.name)} onChange={() => setServiceMunicipalities(toggleValue(serviceMunicipalities, item.name))} />{item.name}</label>)}</div></div>
        <label className="field-label md:col-span-2">Dirección profesional o del local<input maxLength={500} className="field font-normal" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Déjala vacía si trabajas a domicilio u online" /></label>
        <label className="field-label md:col-span-2">Cómo mostrar la ubicación<select className="field" value={locationVisibility} onChange={(event) => setLocationVisibility(event.target.value)}><option value="service_area">Solo municipios y zona de servicio</option><option value="approximate">Ubicación aproximada, pendiente de verificar</option>{profile.latitude !== null && profile.longitude !== null ? <option value="exact">Dirección exacta con coordenadas verificadas</option> : null}<option value="hidden">No mostrar ubicación</option></select><span className="mt-2 block text-xs font-normal leading-5 text-muted">Tenlo revisará la ubicación antes de publicarla. Nunca indiques un domicilio particular si atiendes a domicilio.</span></label>
      </fieldset>

      <fieldset className="grid gap-4 rounded-2xl border border-line p-4 md:grid-cols-2">
        <legend className="px-2 text-sm font-bold text-primary">3. Disponibilidad y contacto</legend>
        <label className="field-label">Email profesional<input type="email" maxLength={180} className="field font-normal" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} /></label>
        <label className="field-label">Teléfono profesional<input type="tel" maxLength={40} className="field font-normal" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
        <label className="field-label">Modalidad<input maxLength={120} className="field font-normal" value={modality} onChange={(event) => setModality(event.target.value)} placeholder="Presencial, online, a domicilio…" /></label>
        <label className="field-label">Edades orientativas<input maxLength={160} className="field font-normal" value={ageRange} onChange={(event) => setAgeRange(event.target.value)} /></label>
        <label className="field-label">Disponibilidad<input maxLength={300} className="field font-normal" value={availability} onChange={(event) => setAvailability(event.target.value)} /></label>
        <label className="field-label">Horarios o franjas<input maxLength={1000} className="field font-normal" value={schedule} onChange={(event) => setSchedule(event.target.value)} /></label>
        <label className="md:col-span-2 flex items-start gap-3 rounded-xl bg-soft p-4 text-sm font-semibold text-ink"><input type="checkbox" className="mt-1 h-4 w-4 accent-primary" checked={acceptsRequests} onChange={(event) => setAcceptsRequests(event.target.checked)} /><span>Acepto recibir solicitudes de familias a través de Tenlo.</span></label>
        {acceptsRequests ? <div className="md:col-span-2"><p className="field-label">Vías de contacto disponibles</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{contactOptions.map((option) => { const unavailable = (option.id === "phone" && !phone.trim()) || (option.id === "email" && !contactEmail.trim()) || (option.id === "website" && !website.trim()); return <label key={option.id} className={`flex items-center gap-3 rounded-xl border border-line p-3 text-sm font-semibold ${unavailable ? "text-muted opacity-60" : "text-ink"}`}><input type="checkbox" className="h-4 w-4 accent-primary" disabled={unavailable} checked={contactPreferences.includes(option.id)} onChange={() => setContactPreferences(toggleValue(contactPreferences, option.id))} />{option.label}</label>; })}</div></div> : null}
      </fieldset>

      <fieldset className="grid gap-4 rounded-2xl border border-line p-4">
        <legend className="px-2 text-sm font-bold text-primary">4. Evidencias de verificación</legend>
        <label className="field-label">Referencia pública o evidencia<textarea maxLength={300} className="field min-h-24 py-3 font-normal" value={verificationInfo} onChange={(event) => setVerificationInfo(event.target.value)} placeholder="Ej. web oficial, registro público o dato que Tenlo pueda comprobar" /><span className="mt-2 block text-xs font-normal leading-5 text-muted">No incluyas documentos de identidad, datos bancarios ni información personal de menores.</span></label>
      </fieldset>

      <section className="rounded-2xl border border-line p-4"><p className="text-sm font-bold text-primary">5. Revisión de Tenlo</p><p className="mt-2 text-sm leading-6 text-slatecopy">Comprobaremos coherencia, fuente pública y datos de contacto. El plan comercial nunca determina la verificación ni la posición orgánica.</p></section>

      <section className="rounded-2xl border border-line p-4"><p className="text-sm font-bold text-primary">6. Guardar y enviar</p><p className="mt-2 text-sm leading-6 text-slatecopy">Puedes completar la ficha por partes mientras esté pendiente. Si estaba rechazada, al guardar volverá a la cola de revisión.</p></section>

      <p className="rounded-2xl border border-line bg-soft p-4 text-sm leading-6 text-slatecopy">Los cambios seguirán siendo privados hasta que Tenlo complete la revisión. No incluyas nombres, horarios ni otros datos identificativos de menores.</p>
      {error ? <p className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral" role="alert">{error}</p> : null}
      {message ? <p className="rounded-xl border border-sage/30 bg-sage/10 p-3 text-sm font-semibold text-petrol" role="status">{message}</p> : null}
      <button className="btn-primary w-full justify-center md:w-fit" disabled={loading}>{loading ? "Guardando…" : profile.status === "rejected" ? "Guardar y reenviar" : "Guardar cambios"}</button>
    </form>
  );
}
