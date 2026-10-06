"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogOut, Trash2 } from "lucide-react";
import { municipalities } from "@/lib/mock-data";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AccountSettingsProps = {
  email: string;
  displayName: string;
  role: string;
  status: string;
  municipality?: string | null;
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

export default function AccountSettings({ email, displayName, role, status, municipality }: AccountSettingsProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [municipalityValue, setMunicipalityValue] = useState(municipality ?? "");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [loading, setLoading] = useState<"password" | "municipality" | "delete" | "logout" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("No hemos podido confirmar tu sesión.");
      return;
    }

    setLoading("delete");
    const { error: insertError } = await supabase.from("submissions").insert({
      user_id: user.id,
      submission_type: "account_deletion",
      payload: {
        email,
        display_name: displayName,
        requested_from: "datos-cuenta"
      }
    });
    setLoading(null);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setDeleteConfirm("");
    setMessage("Solicitud de borrado recibida. El equipo de Tenlo la revisará antes de eliminar o anonimizar datos asociados.");
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
          Por seguridad, el email y el nombre público no se editan desde esta pantalla. Si necesitas corregir un dato, contacta con Tenlo.
        </p>
        <dl className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-soft p-4">
            <dt className="text-sm font-semibold text-muted">Email</dt>
            <dd className="mt-1 text-base font-bold text-slatecopy">{email}</dd>
          </div>
          <div className="rounded-2xl bg-soft p-4">
            <dt className="text-sm font-semibold text-muted">Nombre público</dt>
            <dd className="mt-1 text-base font-bold text-slatecopy">{displayName}</dd>
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
      </section>

      <section className="card p-5 md:p-6">
        <h2 className="text-xl font-bold text-slatecopy">Cambiar contraseña</h2>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handlePasswordUpdate}>
          <div className="field-label md:col-span-2">
            <label htmlFor="account-current-password">Contraseña actual</label>
            <div className="relative mt-2">
              <input id="account-current-password" required type={showCurrentPassword ? "text" : "password"} className="field m-0 pr-12 font-normal placeholder:text-muted" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Escribe tu contraseña actual" />
              <button type="button" className="absolute inset-y-0 right-3 my-auto inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-ink/20" onClick={() => setShowCurrentPassword((visible) => !visible)} aria-label={showCurrentPassword ? "Ocultar contraseña actual" : "Mostrar contraseña actual"} aria-pressed={showCurrentPassword}>
                {showCurrentPassword ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
              </button>
            </div>
          </div>
          <div className="field-label">
            <label htmlFor="account-password">Nueva contraseña</label>
            <div className="relative mt-2">
              <input id="account-password" required type={showPassword ? "text" : "password"} minLength={8} className="field m-0 pr-12 font-normal placeholder:text-muted" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 8 caracteres" />
              <button type="button" className="absolute inset-y-0 right-3 my-auto inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-ink/20" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPassword}>
                {showPassword ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
              </button>
            </div>
          </div>
          <div className="field-label">
            <label htmlFor="account-password-confirm">Confirmar nueva contraseña</label>
            <div className="relative mt-2">
              <input id="account-password-confirm" required type={showPasswordConfirm ? "text" : "password"} minLength={8} className="field m-0 pr-12 font-normal placeholder:text-muted" value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} placeholder="Repite la contraseña" />
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
          <button className="btn-secondary justify-center" type="button" onClick={handleLogout} disabled={loading === "logout"}>
            <LogOut size={18} aria-hidden />
            {loading === "logout" ? "Cerrando..." : "Cerrar sesión"}
          </button>
        </div>
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
