"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { pushTrackingEvent } from "@/lib/analytics";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";

export default function PasswordRecoveryRequest() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!hasSupabaseBrowserConfig()) {
      setStatus("error");
      setError("La recuperación de acceso no está disponible temporalmente.");
      pushTrackingEvent("password_recovery_request_failed", { failure_reason: "config_missing" });
      return;
    }

    setStatus("sending");
    const supabase = createSupabaseBrowserClient();
    const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/restablecer-contrasena")}`
    });

    if (recoveryError) {
      setStatus("error");
      setError("No hemos podido iniciar la recuperación. Espera unos minutos e inténtalo de nuevo.");
      pushTrackingEvent("password_recovery_request_failed", { failure_reason: "provider_error" });
      return;
    }

    setStatus("sent");
    pushTrackingEvent("password_recovery_requested", { delivery_channel: "email" });
  }

  return (
    <div className="section-shell">
      <div className="mx-auto max-w-xl card p-6 md:p-8">
        <p className="label">Acceso a Tenlo</p>
        <h1 className="detail-title mt-3">Recuperar contraseña</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Escribe el email de tu cuenta. Si existe, recibirás un enlace seguro para crear una contraseña nueva.
        </p>

        {status === "sent" ? (
          <div className="mt-6 rounded-2xl border border-sage/40 bg-sage/10 p-5" role="status">
            <h2 className="text-lg font-bold text-slatecopy">Revisa tu correo</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Si hay una cuenta asociada, te hemos enviado las instrucciones. Revisa también la carpeta de spam.</p>
          </div>
        ) : (
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="recovery-email">
              Email de la cuenta
              <input id="recovery-email" type="email" required autoComplete="email" className="field font-normal placeholder:text-muted" placeholder="tu@email.com" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            {error ? <p className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral" role="alert">{error}</p> : null}
            <button className="btn-primary w-full justify-center sm:w-fit" type="submit" disabled={status === "sending"}>{status === "sending" ? "Enviando..." : "Enviar enlace"}</button>
          </form>
        )}

        <Link href="/login" className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-ink underline decoration-ink/35 underline-offset-4">Volver a entrar</Link>
      </div>
    </div>
  );
}
