"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { id: string; name: string; website: string | null; location: string; service: string | null; notes: string | null };

export default function AdminProviderSuggestionReview({ id, name, website, location, service, notes }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function convert(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setFeedback("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/provider-suggestion-convert", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: id, name: form.get("name"), website: form.get("website"), municipality: form.get("municipality"), category: form.get("category"), description: form.get("description") })
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "No se pudo crear la ficha.");
      setFeedback("Ficha No verificada creada y publicada."); router.refresh();
    } catch (error) { setFeedback(error instanceof Error ? error.message : "No se pudo crear la ficha."); }
    finally { setPending(false); }
  }

  return (
    <details className="mt-4 rounded-xl border border-line bg-white p-3">
      <summary className="cursor-pointer font-bold text-ink">Revisar y crear ficha No verificada</summary>
      <p className="mt-2 text-xs leading-5 text-muted">Contrasta los datos con una fuente profesional pública. Esta acción publica una ficha sin propietario, sin solicitudes activas y con confianza “No verificada”.</p>
      <form className="mt-3 grid gap-3" onSubmit={convert}>
        <label className="field-label text-xs">Nombre revisado<input name="name" defaultValue={name} className="field font-normal" required minLength={2} maxLength={160} /></label>
        <label className="field-label text-xs">Web pública revisada<input name="website" defaultValue={website ?? ""} className="field font-normal" type="url" placeholder="https://..." maxLength={500} /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="field-label text-xs">Municipio<input name="municipality" defaultValue={location} className="field font-normal" required minLength={2} maxLength={160} /></label>
          <label className="field-label text-xs">Categoría<input name="category" defaultValue={service ?? ""} className="field font-normal" required minLength={2} maxLength={160} /></label>
        </div>
        <label className="field-label text-xs">Descripción contrastada<textarea name="description" defaultValue={notes ?? ""} className="field min-h-28 py-3 font-normal" required minLength={20} maxLength={2000} /></label>
        <button className="btn-primary sm:w-fit" disabled={pending}>{pending ? "Creando…" : "Crear ficha No verificada"}</button>
        {feedback ? <p className="text-xs leading-5 text-muted" role="status">{feedback}</p> : null}
      </form>
    </details>
  );
}
