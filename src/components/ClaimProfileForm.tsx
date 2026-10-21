"use client";

import { type FormEvent, useState } from "react";
import { pushTrackingEvent } from "@/lib/analytics";

type ClaimProfileFormProps = {
  entityType: "center" | "provider" | "community";
  entityId: string;
  entityName: string;
  entityHref: string;
};

export default function ClaimProfileForm({ entityType, entityId, entityName, entityHref }: ClaimProfileFormProps) {
  const [step, setStep] = useState<"intro" | "form">("intro");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!accepted) {
      setError("Debes confirmar que actúas como adulto responsable de esta ficha.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    setLoading(true);
    const response = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, entityType, entityId, entityName })
    });
    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error || "No se ha podido enviar la solicitud.");
      return;
    }

    pushTrackingEvent("claim_submitted", { event_id: result.eventId, item: entityId, type: entityType });
    pushTrackingEvent("profile_submitted", { entity_type: entityType });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="card p-6">
        <h2 className="text-2xl font-semibold text-ink">Solicitud recibida</h2>
        <p className="mt-3 text-sm leading-6 text-muted">Gracias. Revisaremos los datos y verificaremos por email tu relación con la ficha antes de actualizarla.</p>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <section className="card mt-8 p-5 md:p-8" aria-labelledby="claim-intro-title">
        <p className="label">Paso 1 de 2</p>
        <h2 id="claim-intro-title" className="mt-2 text-2xl font-bold text-ink">Confirma que esta es tu ficha</h2>
        <div className="mt-5 rounded-2xl border border-line bg-soft p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Ficha actual</p>
          <p className="mt-2 text-lg font-bold text-ink">{entityName}</p>
          <a href={entityHref} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center font-semibold text-ink underline underline-offset-4">Ver la ficha publicada</a>
        </div>
        <p className="mt-5 text-sm leading-6 text-slatecopy">En el siguiente paso confirmarás tu relación con la entidad y podrás indicar las correcciones prioritarias. Tenlo revisará la solicitud antes de cambiar información visible.</p>
        <button type="button" className="btn-primary mt-6" onClick={() => { pushTrackingEvent("profile_edit_started", { entity_type: entityType }); setStep("form"); }}>Sí, quiero gestionar esta ficha</button>
      </section>
    );
  }

  return (
    <form className="card mt-8 grid gap-5 p-5 md:p-8" onSubmit={handleSubmit}>
      <div><p className="label">Paso 2 de 2</p><h2 className="mt-2 text-2xl font-bold text-ink">Confirma tu relación y los cambios</h2><button type="button" className="mt-2 text-sm font-semibold text-ink underline underline-offset-4" onClick={() => setStep("intro")}>Volver a la ficha</button></div>
      <label className="hidden" aria-hidden="true">
        Empresa
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="field-label">
          Nombre y apellidos
          <input required name="requesterName" className="field" placeholder="Nombre de la persona responsable" />
        </label>
        <label className="field-label">
          Email profesional
          <input required name="requesterEmail" type="email" className="field" placeholder="tu@email.com" />
        </label>
        <label className="field-label">
          Teléfono de contacto
          <input name="requesterPhone" className="field" placeholder="Opcional" />
        </label>
        <label className="field-label">
          Relación con la ficha
          <select required name="roleDescription" className="field" defaultValue="">
            <option value="" disabled>Selecciona una opción</option>
            <option value="Titular o dirección">Titular o dirección</option>
            <option value="Equipo de administración">Equipo de administración</option>
            <option value="Responsable de comunicación">Responsable de comunicación</option>
            <option value="Profesional independiente">Profesional independiente</option>
            <option value="Otra relación verificable">Otra relación verificable</option>
          </select>
        </label>
        <label className="field-label md:col-span-2">
          Web oficial
          <input name="officialWebsite" type="url" className="field" placeholder="https://..." />
        </label>
        <label className="field-label md:col-span-2">
          Imagen sugerida
          <input name="imageUrl" type="url" className="field" placeholder="URL de una imagen oficial o página donde revisarla" />
        </label>
        <label className="field-label md:col-span-2">
          Correcciones o datos que quieres validar
          <textarea required name="corrections" className="field min-h-36 py-3" placeholder="Horarios, teléfono, servicios, edades, fuente oficial, condiciones..." />
        </label>
      </div>
      <label className="rounded-xl border border-line bg-soft p-4 text-sm font-semibold leading-6 text-slatecopy">
        <input required type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mr-2 h-4 w-4 rounded border-line" />
        Confirmo que actúo como adulto responsable o representante autorizado, y que la información no incluye datos personales, fotos ni horarios identificativos de menores.
      </label>
      {error ? <p className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral">{error}</p> : null}
      <button className="btn-primary w-full md:w-fit" type="submit" disabled={loading || !accepted}>{loading ? "Enviando..." : "Solicitar gestión de la ficha"}</button>
    </form>
  );
}
