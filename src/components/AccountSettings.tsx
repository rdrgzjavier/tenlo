"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, EyeOff, LogOut, Trash2 } from "lucide-react";
import { municipalities } from "@/lib/mock-data";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AccountSettingsProps = {
  email: string;
  displayName: string;
  role: string;
  status: string;
  municipality?: string | null;
  marketingConsent: boolean;
  marketingConsentAt?: string | null;
  marketingConsentWithdrawnAt?: string | null;
};

function statusLabel(status: string) {
  if (status === "approved") return "Cuenta activa";
  if (status === "rejected") return "No aprobada";
  if (status === "needs_changes") return "Necesita revisión";
  return "Pendiente de revisión";
}

function roleLabel(role: string) {
  if (role === "family") return "Familia";
  if (role === "school") return "Centro educativo";
  if (role === "activity_provider") return "Actividad local";
  if (role === "teacher") return "Profesional independiente";
  if (role === "health_wellness") return "Salud y bienestar";
  if (role === "camp_provider") return "Campamentos y vacaciones";
  return "Cuenta Tenlo";
}

function normalizePublicName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function isValidPublicName(value: string) {
  const normalized = normalizePublicName(value);
  return normalized.length >= 3 && normalized.length <= 40 && /^[\p{L}\p{N} ._-]+$/u.test(normalized);
}

export default function AccountSettings({ email, displayName, role, status, municipality, marketingConsent, marketingConsentAt, marketingConsentWithdrawnAt }: AccountSettingsProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [displayNameValue, setDisplayNameValue] = useState(displayName);
  const [municipalityValue, setMunicipalityValue] = useState(municipality ?? "");
  const [marketingConsentValue, setMarketingConsentValue] = useState(marketingConsent);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [loading, setLoading] = useState<"profile" | "password" | "municipality" | "marketing" | "delete" | "logout" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePublicNameUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const publicName = displayNameValue.trim().replace(/\s+/g, " ");
    if (!isValidPublicName(publicName)) {
      setError("El nombre público debe tener entre 3 y 40 caracteres y usar solo letras, números, espacios, punto, guion o guion bajo.");
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) {
      setError("No hemos podido confirmar tu sesión.");
      return;
    }

    setLoading("profile");
    const { error: usernameError } = await supabase.from("profile_usernames").upsert(
      { profile_id: user.id, public_name_normalized: normalizePublicName(publicName) },
      { onConflict: "profile_id" }
    );

    if (usernameError) {
      setLoading(null);
      setError(usernameError.code === "23505" ? "Ese nombre público ya está en uso." : "No hemos podido reservar el nombre público.");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ display_name: publicName, public_name: publicName })
      .eq("id", user.id);
    setLoading(null);

    if (profileError) {
      await supabase.from("profile_usernames").upsert(
        { profile_id: user.id, public_name_normalized: normalizePublicName(displayName) },
        { onConflict: "profile_id" }
      );
      setError("No hemos podido actualizar el nombre público.");
      return;
    }

    setDisplayNameValue(publicName);
    setMessage("Nombre público actualizado.");
    router.refresh();
  }

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!currentPassword) {
      setError("Escribe tu contraseña actual para confirmar que eres tú.");
      return;
    }

    if (!email) {
      setError("No hemos podido confirmar el email de la cuenta para cambiar la contraseña.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading("password");
    const { error: confirmError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword
    });

    if (confirmError) {
      setLoading(null);
      setError("La contraseña actual no es correcta.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setCurrentPassword("");
    setPassword("");
    setPasswordConfirm("");
    setMessage("Contraseña actualizada correctamente.");
  }

  async function handleMunicipalityUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("No hemos podido confirmar tu sesión.");
      return;
    }

    setLoading("municipality");
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ municipality: municipalityValue || null })
      .eq("id", user.id);
    setLoading(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Municipio principal actualizado.");
    router.refresh();
  }

  async function handleDeleteRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (deleteConfirm !== "BORRAR") {
      setError("Escribe BORRAR para solicitar la baja de la cuenta.");
      return;
    }

    setLoading("delete");
    const response = await fetch("/api/account/deletion-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmation: deleteConfirm }) });
    const result = (await response.json()) as { error?: string; alreadyRequested?: boolean };
    setLoading(null);

    if (!response.ok) {
      setError(result.error || "No hemos podido registrar la solicitud de baja.");
      return;
    }

    setDeleteConfirm("");
    setMessage(result.alreadyRequested ? "Ya tienes una solicitud de baja pendiente de revisión." : "Solicitud de borrado recibida. El equipo de Tenlo la revisará antes de eliminar o anonimizar datos asociados.");
  }

  async function handleMarketingUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) {
      setError("No hemos podido confirmar tu sesión.");
      return;
    }

    const changedAt = new Date().toISOString();
    setLoading("marketing");
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        marketing_consent: marketingConsentValue,
        marketing_consent_at: marketingConsentValue ? marketingConsentAt ?? changedAt : null,
        marketing_consent_source: marketingConsentValue ? "account_settings" : null,
        marketing_consent_withdrawn_at: marketingConsentValue ? null : marketingConsent ? changedAt : marketingConsentWithdrawnAt ?? null
      })
      .eq("id", user.id);
    setLoading(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage(marketingConsentValue ? "Consentimiento de novedades actualizado." : "Has dejado de recibir comunicaciones de marketing.");
    router.refresh();
  }

  async function handleLogout() {
    setLoading("logout");
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      {error ? <p className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral">{error}</p> : null}
      {message ? <p className="rounded-xl border border-sage/30 bg-sage/10 p-3 text-sm font-semibold text-petrol">{message}</p> : null}

      <section className="card p-5 md:p-6">
        <h2 className="text-xl font-bold text-slatecopy">Datos visibles de la cuenta</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          El email identifica tu acceso y requiere un proceso de verificación para cambiarlo. Puedes corregir aquí tu nombre público y municipio.
        </p>
        <dl className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-soft p-4">
            <dt className="text-sm font-semibold text-muted">Email</dt>
            <dd className="mt-1 text-base font-bold text-slatecopy">{email}</dd>
          </div>
          <div className="rounded-2xl bg-soft p-4">
            <dt className="text-sm font-semibold text-muted">Nombre público</dt>
            <dd className="mt-1 text-base font-bold text-slatecopy">{displayNameValue}</dd>
          </div>
          <div className="rounded-2xl bg-soft p-4">
            <dt className="text-sm font-semibold text-muted">Tipo de cuenta</dt>
            <dd className="mt-1 text-base font-bold text-slatecopy">{roleLabel(role)}</dd>
          </div>
          <div className="rounded-2xl bg-soft p-4">
            <dt className="text-sm font-semibold text-muted">Estado</dt>
            <dd className="mt-1 text-base font-bold text-slatecopy">{statusLabel(status)}</dd>
          </div>
        </dl>
        <form className="mt-5 grid gap-3 rounded-2xl bg-soft p-4 md:grid-cols-[1fr_auto]" onSubmit={handlePublicNameUpdate}>
          <label className="field-label">
            Nombre público
            <input className="field bg-white font-normal" minLength={3} maxLength={40} value={displayNameValue} onChange={(event) => setDisplayNameValue(event.target.value)} />
          </label>
          <button className="btn-secondary self-end justify-center" type="submit" disabled={loading === "profile"}>
            {loading === "profile" ? "Guardando..." : "Guardar nombre"}
          </button>
        </form>
        <form className="mt-5 grid gap-3 rounded-2xl bg-soft p-4 md:grid-cols-[1fr_auto]" onSubmit={handleMunicipalityUpdate}>
          <label className="field-label">
            Municipio principal
            <select className="field bg-white" value={municipalityValue} onChange={(event) => setMunicipalityValue(event.target.value)}>
              <option value="">No indicado</option>
              {municipalities.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
          </label>
          <button className="btn-secondary self-end justify-center" type="submit" disabled={loading === "municipality"}>
            {loading === "municipality" ? "Guardando..." : "Guardar municipio"}
          </button>
        </form>
        <form className="mt-4 rounded-2xl border border-line bg-white p-4" onSubmit={handleMarketingUpdate}>
          <label className="flex items-start gap-3 text-sm leading-6 text-slatecopy">
            <input type="checkbox" checked={marketingConsentValue} onChange={(event) => setMarketingConsentValue(event.target.checked)} className="mt-1 h-4 w-4 rounded border-line" />
            <span>Quiero recibir novedades, recursos y recomendaciones de Tenlo. Esta preferencia no afecta a los emails operativos necesarios para gestionar mi cuenta.</span>
          </label>
          <button className="btn-secondary mt-4 justify-center" type="submit" disabled={loading === "marketing"}>
            {loading === "marketing" ? "Guardando..." : "Guardar preferencia"}
          </button>
        </form>
      </section>

      <section className="card p-5 md:p-6">
        <h2 className="text-xl font-bold text-slatecopy">Cambiar contraseña</h2>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handlePasswordUpdate}>
          <div className="field-label md:col-span-2">
            <label htmlFor="account-current-password">Contraseña actual</label>
            <div className="relative mt-2">
              <input id="account-current-password" required type={showCurrentPassword ? "text" : "password"} autoComplete="current-password" className="field m-0 pr-12 font-normal placeholder:text-muted" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Escribe tu contraseña actual" />
              <button type="button" className="absolute inset-y-0 right-3 my-auto inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-ink/20" onClick={() => setShowCurrentPassword((visible) => !visible)} aria-label={showCurrentPassword ? "Ocultar contraseña actual" : "Mostrar contraseña actual"} aria-pressed={showCurrentPassword}>
                {showCurrentPassword ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
              </button>
            </div>
          </div>
          <div className="field-label">
            <label htmlFor="account-password">Nueva contraseña</label>
            <div className="relative mt-2">
              <input id="account-password" name="newPassword" required type={showPassword ? "text" : "password"} minLength={8} autoComplete="new-password" className="field m-0 pr-12 font-normal placeholder:text-muted" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 8 caracteres" />
              <button type="button" className="absolute inset-y-0 right-3 my-auto inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-ink/20" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPassword}>
                {showPassword ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
              </button>
            </div>
          </div>
          <div className="field-label">
            <label htmlFor="account-password-confirm">Confirmar nueva contraseña</label>
            <div className="relative mt-2">
              <input id="account-password-confirm" name="newPasswordConfirm" required type={showPasswordConfirm ? "text" : "password"} minLength={8} autoComplete="new-password" className="field m-0 pr-12 font-normal placeholder:text-muted" value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} placeholder="Repite la contraseña" />
              <button type="button" className="absolute inset-y-0 right-3 my-auto inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-ink/20" onClick={() => setShowPasswordConfirm((visible) => !visible)} aria-label={showPasswordConfirm ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPasswordConfirm}>
                {showPasswordConfirm ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
              </button>
            </div>
          </div>
          <button className="btn-primary w-full md:w-fit" type="submit" disabled={loading === "password"}>{loading === "password" ? "Actualizando..." : "Actualizar contraseña"}</button>
        </form>
      </section>

      <section className="card p-5 md:p-6">
        <h2 className="text-xl font-bold text-slatecopy">Seguridad y baja</h2>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a className="btn-secondary justify-center" href="/api/account/export" download>
            <Download size={18} aria-hidden />
            Descargar mis datos
          </a>
          <button className="btn-secondary justify-center" type="button" onClick={handleLogout} disabled={loading === "logout"}>
            <LogOut size={18} aria-hidden />
            {loading === "logout" ? "Cerrando..." : "Cerrar sesión"}
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted">La descarga se genera en el momento, requiere tu sesión activa y no se almacena en el navegador de Tenlo.</p>
        <form className="mt-6 rounded-2xl border border-coral/20 bg-coral/5 p-4" onSubmit={handleDeleteRequest}>
          <h3 className="minor-title">Solicitar borrado de cuenta</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Para proteger la trazabilidad de publicaciones y revisiones, el equipo de Tenlo revisa la baja antes de eliminar o anonimizar datos asociados.
          </p>
          <label className="field-label mt-4 block">
            Escribe BORRAR para confirmar la solicitud
            <input className="field font-normal placeholder:text-muted" value={deleteConfirm} onChange={(event) => setDeleteConfirm(event.target.value)} placeholder="BORRAR" />
          </label>
          <button className="btn-secondary mt-4 border-coral/40 text-coral hover:border-coral hover:text-coral" type="submit" disabled={loading === "delete"}>
            <Trash2 size={18} aria-hidden />
            {loading === "delete" ? "Enviando..." : "Solicitar borrado"}
          </button>
        </form>
      </section>
    </div>
  );
}
