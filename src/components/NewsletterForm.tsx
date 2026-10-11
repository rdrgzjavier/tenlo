"use client";

import { type FormEvent, useState } from "react";
import { pushTrackingEvent } from "@/lib/analytics";

export default function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          consent: formData.get("consent") === "on",
          website: formData.get("website")
        })
      });
      const result = await response.json() as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "No hemos podido guardar tu suscripción. Inténtalo de nuevo.");
      }

      form.reset();
      setStatus("sent");
      setMessage("Ya estás en la lista. Te avisaremos cuando haya novedades útiles en tu zona.");
      pushTrackingEvent("newsletter_subscribed", { placement: "home" });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No hemos podido guardar tu suscripción. Inténtalo de nuevo.");
      pushTrackingEvent("newsletter_failed", { placement: "home" });
    }
  }

  return (
    <form className="grid min-w-[min(100%,460px)] gap-3" onSubmit={handleSubmit}>
      <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
        <label className="sr-only" htmlFor="newsletter-email">Tu correo electrónico</label>
        <input id="newsletter-email" name="email" type="email" required autoComplete="email" maxLength={180} placeholder="Tu correo electrónico" className="field m-0 bg-white" />
        <button className="btn-primary" type="submit" disabled={status === "sending"}>{status === "sending" ? "Guardando..." : "Suscribirme"}</button>
      </div>
      <label className="flex items-start gap-2 text-xs leading-5 text-slatecopy">
        <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-ink" />
        <span>Acepto recibir novedades de Tenlo por email. Podré darme de baja en cualquier momento.</span>
      </label>
      <label className="sr-only" aria-hidden="true">
        No rellenes este campo
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>
      {message ? <p className={`text-sm font-semibold ${status === "error" ? "text-coral" : "text-petrol"}`} role="status">{message}</p> : null}
    </form>
  );
}
