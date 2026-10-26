"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { pushTrackingEvent } from "@/lib/analytics";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";

export default function PasswordResetForm() {
  const searchParams = useSearchParams();
  const invalidLink = Boolean(searchParams.get("error"));
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(searchParams.get("error") ? "error" : "idle");
  const [error, setError] = useState(searchParams.get("error") ? "El enlace no es válido o ha caducado. Solicita uno nuevo." : "");

  useEffect(() => {
    if (invalidLink) pushTrackingEvent("password_reset_failed", { failure_reason: "invalid_link", failure_stage: "verification" });
  }, [invalidLink]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setStatus("error");
      setError("La contraseña debe tener al menos 8 caracteres.");
      pushTrackingEvent("password_reset_failed", { failure_reason: "password_too_short", failure_stage: "validation" });
      return;
    }
    if (password !== confirmation) {
      setStatus("error");
      setError("Las contraseñas no coinciden.");
      pushTrackingEvent("password_reset_failed", { failure_reason: "password_mismatch", failure_stage: "validation" });
      return;
    }
    if (!hasSupabaseBrowserConfig()) {
      setStatus("error");
      setError("El cambio de contraseña no está disponible temporalmente.");
      pushTrackingEvent("password_reset_failed", { failure_reason: "config_missing", failure_stage: "update" });
      return;
    }

    setStatus("saving");
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setStatus("error");
      setError("No hemos podido cambiar la contraseña. El enlace puede haber caducado.");
      pushTrackingEvent("password_reset_failed", { failure_reason: "provider_error", failure_stage: "update" });
      return;
    }

    setPassword("");
    setConfirmation("");
    setStatus("saved");
    pushTrackingEvent("password_reset_completed", { method: "email_link" });
  }

  return (
    <div className="section-shell">
      <div className="mx-auto max-w-xl card p-6 md:p-8">
        <p className="label">Acceso a Tenlo</p>
        <h1 className="detail-title mt-3">Crear nueva contraseña</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Utiliza al menos 8 caracteres y evita reutilizar contraseñas de otros servicios.</p>

        {invalidLink ? (
          <div className="mt-6 rounded-2xl border border-coral/30 bg-coral/10 p-5" role="alert">
            <h2 className="text-lg font-bold text-coral">Necesitas un enlace nuevo</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Este enlace no se ha podido validar. Solicita otro y utiliza únicamente el mensaje más reciente.</p>
            <Link href="/recuperar-contrasena" className="btn-primary mt-5 w-full justify-center sm:w-fit">Solicitar otro enlace</Link>
          </div>
        ) : status === "saved" ? (
          <div className="mt-6 rounded-2xl border border-sage/40 bg-sage/10 p-5" role="status">
            <h2 className="text-lg font-bold text-slatecopy">Contraseña actualizada</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Ya puedes volver a tu cuenta con la nueva contraseña.</p>
            <Link href="/area-personal" className="btn-primary mt-5">Ir al área personal</Link>
          </div>
        ) : (
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="new-password">
              Nueva contraseña
              <input id="new-password" type="password" required minLength={8} autoComplete="new-password" className="field font-normal placeholder:text-muted" placeholder="Mínimo 8 caracteres" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <label className="field-label" htmlFor="new-password-confirmation">
              Confirmar nueva contraseña
              <input id="new-password-confirmation" type="password" required minLength={8} autoComplete="new-password" className="field font-normal placeholder:text-muted" placeholder="Repite la contraseña" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
            </label>
            {error ? <p className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral" role="alert">{error}</p> : null}
            <button className="btn-primary w-full justify-center sm:w-fit" type="submit" disabled={status === "saving"}>{status === "saving" ? "Actualizando..." : "Guardar contraseña"}</button>
          </form>
        )}

        {!invalidLink && status === "error" ? <Link href="/recuperar-contrasena" className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-ink underline decoration-ink/35 underline-offset-4">Solicitar otro enlace</Link> : null}
      </div>
    </div>
  );
}
