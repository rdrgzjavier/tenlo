"use client";

import Link from "next/link";
import { CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { pushTrackingEvent } from "@/lib/analytics";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";

type FormStatus = "checking" | "ready" | "saving" | "saved" | "error";

export default function InvitationSetupForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [destination, setDestination] = useState("/area-personal");
  const [status, setStatus] = useState<FormStatus>("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkInvitation() {
      if (searchParams.get("error")) {
        if (active) {
          setStatus("error");
          setError("El enlace de invitación no es válido o ha caducado.");
        }
        return;
      }

      if (!hasSupabaseBrowserConfig()) {
        if (active) {
          setStatus("error");
          setError("La activación de la cuenta no está disponible temporalmente.");
        }
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { data: authData } = await supabase.auth.getUser();
      if (!active) return;

      if (!authData.user) {
        setStatus("error");
        setError("No hemos podido validar la invitación en este navegador.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (!active) return;
      if (profile?.role && !["family", "tenlo_admin"].includes(profile.role)) {
        setDestination("/mi-ficha-profesional");
      }
      setStatus("ready");
    }

    void checkInvitation();
    return () => {
      active = false;
    };
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setStatus("ready");
      setError("La contraseña debe tener al menos 8 caracteres.");
      pushTrackingEvent("invitation_setup_failed", { failure_stage: "validation", failure_reason: "password_length" });
      return;
    }
    if (password !== confirmation) {
      setStatus("ready");
      setError("Las contraseñas no coinciden.");
      pushTrackingEvent("invitation_setup_failed", { failure_stage: "validation", failure_reason: "password_mismatch" });
      return;
    }

    setStatus("saving");
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setStatus("error");
      setError("No hemos podido guardar la contraseña. El enlace puede haber caducado.");
      pushTrackingEvent("invitation_setup_failed", { failure_stage: "auth", failure_reason: "password_update" });
      return;
    }

    setPassword("");
    setConfirmation("");
    setStatus("saved");
    pushTrackingEvent("invitation_setup_completed", { account_type: destination === "/mi-ficha-profesional" ? "provider" : "user" });
  }

  if (status === "checking") {
    return (
      <section className="card p-6 text-center md:p-8" aria-live="polite">
        <p className="text-base font-semibold text-slatecopy">Validando tu invitación…</p>
      </section>
    );
  }

  if (status === "saved") {
    return (
      <section className="card p-6 md:p-8" role="status">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage/15 text-petrol">
          <CheckCircle2 size={26} aria-hidden />
        </span>
        <p className="label mt-5">Cuenta activada</p>
        <h1 className="detail-title mt-3">Tu acceso a Tenlo está listo</h1>
        <p className="mt-3 text-base leading-7 text-muted">El email ha quedado confirmado y tu contraseña se ha guardado correctamente.</p>
        <Link href={destination} className="btn-primary mt-6 w-full justify-center sm:w-fit">
          {destination === "/mi-ficha-profesional" ? "Completar mi ficha profesional" : "Ir a mi área personal"}
        </Link>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="card p-6 md:p-8" role="alert">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/10 text-coral">
          <KeyRound size={25} aria-hidden />
        </span>
        <p className="label mt-5">Acceso pendiente</p>
        <h1 className="detail-title mt-3">Necesitamos un enlace nuevo</h1>
        <p className="mt-3 text-base leading-7 text-muted">{error}</p>
        <p className="mt-3 text-sm leading-6 text-muted">Solicita un enlace seguro para establecer tu contraseña y continuar con la activación.</p>
        <Link href="/recuperar-contrasena" className="btn-primary mt-6 w-full justify-center sm:w-fit">Solicitar un nuevo enlace</Link>
      </section>
    );
  }

  return (
    <section className="card p-6 md:p-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-ink">
        <KeyRound size={25} aria-hidden />
      </span>
      <p className="label mt-5">Invitación verificada</p>
      <h1 className="detail-title mt-3">Crea tu contraseña</h1>
      <p className="mt-3 text-base leading-7 text-muted">Tu email ya está confirmado. Elige una contraseña para poder volver a entrar en Tenlo cuando quieras.</p>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="invitation-password">
          Contraseña
          <span className="relative mt-2 block">
            <input id="invitation-password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" className="field m-0 pr-12 font-normal placeholder:text-muted" placeholder="Mínimo 8 caracteres" value={password} onChange={(event) => setPassword(event.target.value)} />
            <button type="button" className="absolute inset-y-0 right-0 flex min-h-11 w-12 items-center justify-center text-muted" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {showPassword ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
            </button>
          </span>
        </label>
        <label className="field-label" htmlFor="invitation-password-confirmation">
          Confirmar contraseña
          <span className="relative mt-2 block">
            <input id="invitation-password-confirmation" type={showConfirmation ? "text" : "password"} required minLength={8} autoComplete="new-password" className="field m-0 pr-12 font-normal placeholder:text-muted" placeholder="Repite la contraseña" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
            <button type="button" className="absolute inset-y-0 right-0 flex min-h-11 w-12 items-center justify-center text-muted" onClick={() => setShowConfirmation((value) => !value)} aria-label={showConfirmation ? "Ocultar confirmación" : "Mostrar confirmación"}>
              {showConfirmation ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
            </button>
          </span>
        </label>

        {error ? <p className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral" role="alert">{error}</p> : null}
        <button className="btn-primary w-full justify-center sm:w-fit" type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Guardando…" : "Guardar contraseña y continuar"}
        </button>
      </form>
    </section>
  );
}
