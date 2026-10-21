"use client";

import { type FormEvent, useState } from "react";
import { categories, centers, municipalities } from "@/lib/mock-data";
import { pushTrackingEvent } from "@/lib/analytics";

export default function PublishForm() {
  const [ok, setOk] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!ok) {
      setError("Debes confirmar las normas de publicación antes de enviar.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const field = (name: string) => String(form.get(name) || "");
    const submissionType = field("publicationType") || "publicacion";
    const payload = {
      publicationType: submissionType,
      category: field("category"),
      municipality: field("municipality"),
      title: field("title"),
      description: field("description"),
      center: field("center"),
      recommended_age: field("recommendedAge"),
      price: field("price"),
      contact: field("contact"),
      source: field("source"),
      adultConfirmation: ok
    };

    setLoading(true);
    const response = await fetch("/api/submission", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(result.error || "No hemos podido enviar la publicación.");
      return;
    }

    pushTrackingEvent("publish", { publication_type: submissionType, category: field("category"), municipality: field("municipality") });
    setSent(true);
  }

  return (
    <div className="section-shell max-w-4xl">
      <h1 className="page-title">Publicar</h1>
      <p className="lead">Toda publicación creada por familias o profesionales locales empieza como pendiente de revisión antes de aparecer públicamente.</p>

      {sent ? (
        <div className="mt-8 rounded-2xl border border-line bg-soft p-5 text-sm font-semibold leading-6 text-slatecopy">
          Publicación enviada a revisión. Podrás verla en Mis publicaciones dentro de tu área personal.
        </div>
      ) : (
        <form className="mt-8 grid gap-6 rounded-2xl border border-line bg-panel p-5 md:p-8" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="field-label">
              Tipo de publicación
              <select required name="publicationType" className="field" defaultValue="">
                <option value="" disabled>Selecciona tipo</option>
                <option value="service_offer">Servicio u oferta profesional</option>
                <option value="family_resource">Producto o recurso familiar</option>
                <option value="community_content">Contenido comunitario</option>
                <option value="informational_profile">Ficha informativa de un centro o entidad</option>
              </select>
            </label>
            <label className="field-label">
              Categoría
              <select required name="category" className="field" defaultValue="">
                <option value="" disabled>Selecciona categoría</option>
                {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </label>
            <label className="field-label">
              Zona
              <select required name="municipality" className="field" defaultValue="">
                <option value="" disabled>Selecciona zona</option>
                {municipalities.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </label>
            <label className="field-label md:col-span-2">Título<input required name="title" className="field" placeholder="Ej. Lote uniforme infantil en buen estado" /></label>
            <label className="field-label md:col-span-2">Descripción<textarea required name="description" className="field min-h-32 py-3" placeholder="Describe el recurso sin incluir datos personales de menores." /></label>
            <label className="field-label">
              Centro relacionado opcional
              <select name="center" className="field" defaultValue="">
                <option value="">No indicado</option>
                {centers.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </label>
            <label className="field-label">Edad recomendada opcional<input name="recommendedAge" className="field" placeholder="Ej. 6-8 años" /></label>
            <label className="field-label">Precio opcional<input name="price" className="field" type="number" min="0" placeholder="0" /></label>
            <label className="field-label">Datos de contacto<input required name="contact" className="field" placeholder="Email o teléfono del adulto" /></label>
            <label className="field-label md:col-span-2">
              Fuente de la información
              <select required name="source" className="field" defaultValue="">
                <option value="" disabled>Indica la fuente</option>
                <option value="official_source">Soy titular o representante del negocio/servicio</option>
                <option value="third_party_public_source">Propongo información pública de un tercero</option>
              </select>
            </label>
          </div>
          <label className="rounded-xl border border-line bg-soft p-4 text-sm font-semibold leading-6 text-slatecopy">
            <input required type="checkbox" checked={ok} onChange={(event) => setOk(event.target.checked)} className="mr-2 h-4 w-4 rounded border-line" />
            Confirmo que esta publicación no incluye datos personales de menores, fotografías de menores ni información sensible. Entiendo que no se publicará sin aprobación del equipo de Tenlo y que podré recibir feedback por email o teléfono.
          </label>
          {error ? <p className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral">{error}</p> : null}
          <button className="btn-primary w-full md:w-fit" type="submit" disabled={!ok || loading}>{loading ? "Enviando..." : "Enviar a revisión"}</button>
        </form>
      )}
    </div>
  );
}
