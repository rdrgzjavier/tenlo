"use client";

import { useState } from "react";

type FeedbackFormProps = {
  context?: string;
  itemId?: string;
};

export default function FeedbackForm({ context = "general", itemId = "" }: FeedbackFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const isContactRequest = context === "contact_request";
  const isReport = context === "report_listing";
  const isProfileMaintenance = ["anuncio", "centro", "servicio"].includes(context);
  const messageLabel = isContactRequest
    ? "¿En qué podemos ayudarte?"
    : isReport
      ? "Motivo del reporte"
      : isProfileMaintenance
        ? "¿Qué debemos revisar?"
        : "Sugerencia o mejora";
  const messagePlaceholder = isContactRequest
    ? "Cuéntanos qué necesitas saber o solicitar a este proveedor. No incluyas datos personales de menores."
    : isReport
      ? "Describe el problema que has detectado para que podamos revisarlo."
      : isProfileMaintenance
        ? "Indica el dato actual y, si lo conoces, la información correcta o el motivo de la retirada."
      : "Cuenta qué servicio, centro, recurso local o mejora te ayudaría a usar mejor Tenlo.";
  const submitLabel = isContactRequest || isProfileMaintenance ? "Enviar solicitud" : isReport ? "Enviar reporte" : "Enviar sugerencia";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context,
        itemId,
        requestType: formData.get("requestType"),
        name: formData.get("name"),
        email: formData.get("email"),
        message: formData.get("message")
      })
    });

    const result = await response.json();
    if (!response.ok) {
      setStatus("error");
      setError(result.error || "No se pudo enviar la sugerencia.");
      return;
    }

    event.currentTarget.reset();
    setStatus("sent");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          Nombre usuario
          <input name="name" className="field font-normal placeholder:text-muted" placeholder="Ej. Marta G." autoComplete="name" />
        </label>
        <label className="field-label">
          Email de contacto{isProfileMaintenance || isReport ? " *" : ""}
          <input name="email" type="email" required={isProfileMaintenance || isReport} className="field font-normal placeholder:text-muted" placeholder="tu@email.com" autoComplete="email" />
        </label>
      </div>
      {isProfileMaintenance || isReport ? (
        <label className="field-label">
          Tipo de solicitud
          <select name="requestType" required className="field font-normal">
            <option value="">Selecciona una opción</option>
            <option value="correction">Corregir información</option>
            <option value="update">Actualizar la ficha</option>
            <option value="withdrawal">Solicitar retirada</option>
            {isReport ? <option value="unsafe_content">Reportar contenido inapropiado</option> : null}
            <option value="other">Otro motivo</option>
          </select>
        </label>
      ) : null}
      <label className="field-label">
        {messageLabel}
        <textarea name="message" required minLength={10} rows={6} className="field min-h-36 resize-y py-3 font-normal placeholder:text-muted" placeholder={messagePlaceholder} />
      </label>
      {error ? <p className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral">{error}</p> : null}
      {status === "sent" ? (
        <p className="rounded-xl border border-line bg-soft p-4 text-sm font-semibold leading-6 text-slatecopy">
          {isProfileMaintenance || isReport
            ? "Solicitud recibida. La revisaremos en un plazo máximo de 4 días laborables y contactaremos contigo si necesitamos confirmar algún dato."
            : "Gracias. Hemos recibido tu sugerencia y la revisaremos."}
        </p>
      ) : null}
      <button type="submit" className="btn-primary w-full sm:w-fit" disabled={status === "sending"}>
        {status === "sending" ? "Enviando..." : submitLabel}
      </button>
    </form>
  );
}
