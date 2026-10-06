"use client";

import Link from "next/link";
import { useState } from "react";
import { pushTrackingEvent } from "@/lib/analytics";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";

type ContactRequestFormProps = {
  targetId: string;
  title: string;
  categoryId: string;
  municipality: string;
};

export default function ContactRequestForm({ targetId, title, categoryId, municipality }: ContactRequestFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "login" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!hasSupabaseBrowserConfig()) {
      setStatus("error");
      setError("Las solicitudes no están disponibles temporalmente.");
      return;
    }

    setStatus("sending");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const supabase = createSupabaseBrowserClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      setStatus("login");
      return;
    }

    const message = String(formData.get("message") || "").trim();
    const contactPreference = String(formData.get("contactPreference") || "tenlo");
    const { data, error: insertError } = await supabase
      .from("connection_requests")
      .insert({
        family_id: authData.user.id,
        target_type: "listing",
        target_id: targetId,
        category_id: categoryId,
        municipality,
        message,
        contact_preference: contactPreference,
        adult_confirmation: true,
        status: "submitted"
      })
      .select("id")
      .single();

    if (insertError) {
      pushTrackingEvent("request_failed", { item: targetId, category: categoryId });
      setStatus("error");
      setError("No hemos podido enviar la solicitud. Inténtalo de nuevo.");
      return;
    }

    pushTrackingEvent("contact_form_completed", { item: targetId, category: categoryId, municipality });
    pushTrackingEvent("request_created", { request_id: data.id, item: targetId, category: categoryId, municipality });
    form.reset();
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-sage/40 bg-sage/10 p-5" role="status">
        <h2 className="text-xl font-semibold text-ink">Solicitud enviada</h2>
        <p className="mt-2 text-sm leading-6 text-slatecopy">La hemos registrado correctamente. El objetivo del piloto es darte una respuesta o alternativa en un máximo de 48 horas.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/solicitudes" className="btn-primary">Ver mis solicitudes</Link>
          <Link href="/buscar" className="btn-secondary">Seguir buscando</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-line bg-soft p-4">
        <p className="text-xs font-bold uppercase tracking-[0.05em] text-muted">Solicitud para</p>
        <p className="mt-1 font-semibold text-ink">{title}</p>
        <p className="mt-1 text-sm text-muted">{municipality}</p>
      </div>
      <label className="field-label">
        ¿Qué necesitas saber o solicitar?
        <textarea name="message" required minLength={10} maxLength={1500} rows={6} className="field min-h-36 resize-y py-3 font-normal placeholder:text-muted" placeholder="Por ejemplo: edad del niño o niña en términos generales, horario que necesitas, fecha orientativa y cualquier requisito relevante. No incluyas nombres, colegio, clase ni datos sensibles de menores." />
      </label>
      <label className="field-label">
        Canal preferido para continuar
        <select name="contactPreference" className="field font-normal" defaultValue="tenlo">
          <option value="tenlo">A través de Tenlo</option>
          <option value="email">Email de mi cuenta</option>
          <option value="phone">Teléfono de mi cuenta</option>
        </select>
      </label>
      <label className="flex items-start gap-3 rounded-2xl border border-line bg-panel p-4 text-sm leading-6 text-slatecopy">
        <input name="adultConfirmation" type="checkbox" required className="mt-1 h-4 w-4 accent-ink" />
        <span>Confirmo que soy una persona adulta y que no he incluido datos identificativos ni sensibles de menores.</span>
      </label>
      {status === "login" ? (
        <div className="rounded-2xl border border-line bg-soft p-4 text-sm leading-6 text-slatecopy" role="status">
          Para enviar y consultar la respuesta necesitas iniciar sesión. <Link href={`/login?next=${encodeURIComponent(`/solicitar?item=${targetId}`)}`} className="font-semibold text-ink underline">Entrar o crear cuenta</Link>
        </div>
      ) : null}
      {error ? <p className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral" role="alert">{error}</p> : null}
      <button type="submit" className="btn-primary w-full sm:w-fit" disabled={status === "sending"}>{status === "sending" ? "Enviando..." : "Enviar solicitud"}</button>
    </form>
  );
}
