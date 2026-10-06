"use client";

import { useState } from "react";

type ProviderSuggestionFormProps = {
  initialLocation?: string;
  initialService?: string;
};

export default function ProviderSuggestionForm({ initialLocation = "", initialService = "" }: ProviderSuggestionFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const providerName = String(data.get("providerName") || "").trim();
    const website = String(data.get("website") || "").trim();
    const location = String(data.get("location") || "").trim();
    const service = String(data.get("service") || "").trim();
    const notes = String(data.get("notes") || "").trim();

    const message = [
      `Proveedor propuesto: ${providerName}`,
      `Web: ${website || "No indicada"}`,
      `Ubicación: ${location}`,
      `Servicio o categoría: ${service || "No indicado"}`,
      `Información adicional: ${notes || "No indicada"}`
    ].join("\n");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: "provider_suggestion",
          itemId: providerName,
          name: data.get("name"),
          email: data.get("email"),
          message
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo enviar la propuesta.");
      form.reset();
      setStatus("sent");
    } catch (submissionError) {
      setStatus("error");
      setError(submissionError instanceof Error ? submissionError.message : "No se pudo enviar la propuesta.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">Nombre del proveedor o centro<input required name="providerName" className="field font-normal placeholder:text-muted" placeholder="Ej. Academia Norte" /></label>
        <label className="field-label">Web pública<input name="website" type="url" className="field font-normal placeholder:text-muted" placeholder="https://..." /></label>
        <label className="field-label">Ubicación<input required name="location" defaultValue={initialLocation} className="field font-normal placeholder:text-muted" placeholder="Municipio o zona" /></label>
        <label className="field-label">Servicio o categoría<input name="service" defaultValue={initialService} className="field font-normal placeholder:text-muted" placeholder="Ej. Robótica, inglés, psicología" /></label>
      </div>
      <label className="field-label">Información adicional<textarea name="notes" rows={4} className="field min-h-28 resize-y py-3 font-normal placeholder:text-muted" placeholder="Cuéntanos qué ofrece o por qué sería útil para las familias." /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">Tu nombre, opcional<input name="name" autoComplete="name" className="field font-normal placeholder:text-muted" placeholder="Ej. Marta G." /></label>
        <label className="field-label">Tu email, opcional<input name="email" type="email" autoComplete="email" className="field font-normal placeholder:text-muted" placeholder="Para aclarar la propuesta" /></label>
      </div>
      <p className="text-sm leading-6 text-muted">La propuesta quedará pendiente de revisión. Tenlo solo creará una ficha <strong>No verificada</strong> cuando pueda contrastar información profesional pública suficiente.</p>
      {error ? <p className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral" role="alert">{error}</p> : null}
      {status === "sent" ? <p className="rounded-xl border border-line bg-soft p-4 text-sm font-semibold leading-6 text-slatecopy">Gracias. Revisaremos la propuesta antes de crear o publicar cualquier ficha.</p> : null}
      <button type="submit" className="btn-primary w-full sm:w-fit" disabled={status === "sending"} data-track-action="provider_suggestion_submitted">
        {status === "sending" ? "Enviando..." : "Proponer proveedor"}
      </button>
    </form>
  );
}
