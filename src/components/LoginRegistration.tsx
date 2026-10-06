"use client";

import {
  BriefcaseBusiness,
  Bus,
  CalendarDays,
  Eye,
  EyeOff,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  Laptop,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  UsersRound
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { centers, municipalities } from "@/lib/mock-data";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRole } from "@/lib/supabase/types";

type UserTypeId =
  | "familia"
  | "centro-educativo"
  | "extraescolares"
  | "tecnologia-online"
  | "transporte"
  | "fiestas-eventos"
  | "profesional-independiente"
  | "salud-bienestar"
  | "campamentos"
  | "otros";

const userTypes: Array<{
  id: UserTypeId;
  label: string;
  helper: string;
  subtypes?: string[];
}> = [
  { id: "familia", label: "Familia", helper: "Cuenta adulta para buscar, guardar y contactar.", subtypes: ["Madre/padre/tutor", "Familiar adulto", "Otro adulto responsable"] },
  { id: "centro-educativo", label: "Centro educativo", helper: "Colegios, escuelas infantiles y guarderías.", subtypes: ["Colegio", "Guardería"] },
  { id: "extraescolares", label: "Actividades extraescolares", helper: "Polideportivos, clubes y empresas de actividades.", subtypes: ["Polideportivo", "Empresa de actividades", "Club o escuela deportiva"] },
  { id: "tecnologia-online", label: "Tecnología y clases online", helper: "Empresas tecnológicas y profesores online.", subtypes: ["Empresa tecnológica", "Profesor particular online", "Academia online"] },
  { id: "transporte", label: "Transporte escolar", helper: "Rutas, transporte organizado y servicios autorizados.", subtypes: ["Servicio de ruta", "Particular o autónomo"] },
  { id: "fiestas-eventos", label: "Fiestas y eventos", helper: "Salas, espacios y organización de eventos familiares.", subtypes: ["Sala de eventos", "Organización de eventos", "Ocio familiar"] },
  { id: "profesional-independiente", label: "Profesional independiente", helper: "Canguros, profesores particulares y profesionales locales.", subtypes: ["Canguro", "Profesor particular", "Monitor o tallerista"] },
  { id: "salud-bienestar", label: "Salud y bienestar", helper: "Psicología, odontología, nutrición y bienestar familiar.", subtypes: ["Psicólogo", "Odontólogo", "Logopeda", "Nutricionista", "Otro profesional sanitario"] },
  { id: "campamentos", label: "Campamentos y vacaciones", helper: "Campamentos, días sin cole y actividades vacacionales.", subtypes: ["Campamento urbano", "Días sin cole", "Campamento externo", "Actividad vacacional"] },
  { id: "otros", label: "Otros", helper: "Servicios locales que no encajan en las categorías anteriores.", subtypes: ["Comercio local", "Asociación", "Servicio familiar", "Otro"] }
];

const roleByType: Record<UserTypeId, ProfileRole> = {
  familia: "family",
  "centro-educativo": "school",
  extraescolares: "activity_provider",
  "tecnologia-online": "technology_provider",
  transporte: "transport_provider",
  "fiestas-eventos": "event_provider",
  "profesional-independiente": "teacher",
  "salud-bienestar": "health_wellness",
  campamentos: "camp_provider",
  otros: "shop"
};

const publicRoles: ProfileRole[] = [
  "family",
  "school",
  "nursery",
  "shop",
  "sports_center",
  "activity_provider",
  "technology_provider",
  "transport_provider",
  "event_provider",
  "teacher",
  "childcare",
  "health_wellness",
  "camp_provider",
  "community_org"
];

const roleExamples = [
  { title: "Familia", text: "Cuenta adulta", Icon: UsersRound, className: "bg-lavender text-ink ring-ink/15" },
  { title: "Centro educativo", text: "Colegio o guardería", Icon: GraduationCap, className: "bg-petrol/10 text-petrol ring-petrol/20" },
  { title: "Actividad local", text: "Extraescolares y campamentos", Icon: Sparkles, className: "bg-coral/10 text-coral ring-coral/20" },
  { title: "Profesional", text: "Servicio independiente", Icon: BriefcaseBusiness, className: "bg-sage/20 text-petrol ring-sage/30" },
  { title: "Salud y bienestar", text: "Profesional colegiado", Icon: HeartPulse, className: "bg-white text-coral ring-coral/20" },
  { title: "Equipo Tenlo", text: "Moderación", Icon: ShieldCheck, className: "bg-white text-sage ring-sage/30" }
];

const typeIcons: Record<UserTypeId, typeof UsersRound> = {
  familia: UsersRound,
  "centro-educativo": GraduationCap,
  extraescolares: Sparkles,
  "tecnologia-online": Laptop,
  transporte: Bus,
  "fiestas-eventos": PartyPopper,
  "profesional-independiente": BriefcaseBusiness,
  "salud-bienestar": HeartPulse,
  campamentos: CalendarDays,
  otros: HelpCircle
};

function selectedType(id: UserTypeId) {
  return userTypes.find((type) => type.id === id) ?? userTypes[0];
}

function needsBusinessFields(type: UserTypeId) {
  return type !== "familia";
}

function needsAgeAndAvailability(type: UserTypeId) {
  return ["extraescolares", "tecnologia-online", "profesional-independiente", "campamentos", "fiestas-eventos", "salud-bienestar"].includes(type);
}

function needsCredentials(type: UserTypeId) {
  return ["centro-educativo", "transporte", "salud-bienestar", "campamentos"].includes(type);
}

function needsMinorSafetyNotice(type: UserTypeId, subtype: string) {
  const normalized = subtype.toLowerCase();
  return type === "profesional-independiente" || normalized.includes("canguro") || normalized.includes("profesor") || normalized.includes("particular");
}

function isChildcareSubtype(subtype: string) {
  return subtype.toLowerCase().includes("canguro");
}

function profileRoleForSelection(type: UserTypeId, subtype: string): ProfileRole {
  if (isChildcareSubtype(subtype)) return "childcare";
  return roleByType[type];
}

function nextPath(value: string | null) {
  return value?.startsWith("/") ? value : "/area-personal";
}

function safeProfileRole(value: unknown): ProfileRole {
  return typeof value === "string" && publicRoles.includes(value as ProfileRole) ? (value as ProfileRole) : "family";
}

function normalizePublicName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function isValidPublicName(value: string) {
  const normalized = normalizePublicName(value);
  return normalized.length >= 3 && normalized.length <= 40 && /^[\p{L}\p{N} ._-]+$/u.test(normalized);
}

function isDuplicatePublicNameError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
}

function blurActiveField() {
  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLElement) {
    activeElement.blur();
  }
}

export default function LoginRegistration() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = nextPath(searchParams.get("next"));
  const supabase = createSupabaseBrowserClient();

  const [userType, setUserType] = useState<UserTypeId>("familia");
  const current = selectedType(userType);
  const [subtype, setSubtype] = useState(current.subtypes?.[0] ?? "");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid" | "unknown">("idle");
  const [registerEmail, setRegisterEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState<"login" | "register" | "google" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const Icon = typeIcons[userType];
  const showBusinessFields = needsBusinessFields(userType);
  const showAgeAndAvailability = needsAgeAndAvailability(userType);
  const showCredentials = needsCredentials(userType);
  const showMinorSafety = needsMinorSafetyNotice(userType, subtype);
  const showChildcareFields = isChildcareSubtype(subtype);
  const passwordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;
  const subtypeOptions = useMemo(() => current.subtypes ?? [], [current]);

  function handleTypeChange(value: UserTypeId) {
    const next = selectedType(value);
    setUserType(value);
    setSubtype(next.subtypes?.[0] ?? "");
  }

  async function checkUsernameAvailability(value = displayName) {
    const normalized = normalizePublicName(value);

    if (!isValidPublicName(value)) {
      setUsernameStatus("invalid");
      return false;
    }

    setUsernameStatus("checking");
    const { data, error: availabilityError } = await supabase
      .from("profile_usernames")
      .select("public_name_normalized")
      .eq("public_name_normalized", normalized)
      .maybeSingle();

    if (availabilityError) {
      setUsernameStatus("unknown");
      return true;
    }

    if (data) {
      setUsernameStatus("taken");
      return false;
    }

    setUsernameStatus("available");
    return true;
  }

  async function createOrUpdateProfile(userId: string) {
    const role = profileRoleForSelection(userType, subtype);
    const status = role === "family" ? "approved" : "pending_review";
    const fallbackName = registerEmail.split("@")[0] || loginEmail.split("@")[0] || "Usuario Tenlo";

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        role,
        display_name: displayName || fallbackName,
        public_name: displayName || fallbackName,
        contact_email: registerEmail || loginEmail,
        phone: phone || null,
        municipality: municipality || null,
        status
      },
      { onConflict: "id" }
    );

    if (profileError) throw profileError;

    const normalizedName = normalizePublicName(displayName || fallbackName);
    await supabase.from("profile_usernames").upsert(
      {
        profile_id: userId,
        public_name_normalized: normalizedName
      },
      { onConflict: "profile_id" }
    );
  }

  async function ensureProfileAfterLogin(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
    const { data } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
    if (data) return;

    const role = safeProfileRole(user.user_metadata?.role);
    const fallbackName = typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name.length > 0
      ? user.user_metadata.display_name
      : user.email?.split("@")[0] || "Usuario Tenlo";
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      role,
      display_name: fallbackName,
      public_name: fallbackName,
      contact_email: user.email ?? null,
      status: role === "family" ? "approved" : "pending_review"
    });

    if (profileError) throw profileError;

    await supabase.from("profile_usernames").upsert(
      {
        profile_id: user.id,
        public_name_normalized: normalizePublicName(fallbackName)
      },
      { onConflict: "profile_id" }
    );
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    blurActiveField();
    setError(null);
    setMessage(null);
    setLoading("login");

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword
    });

    try {
      if (loginError) throw loginError;
      if (data.user) await ensureProfileAfterLogin(data.user);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No hemos podido iniciar sesión.");
    } finally {
      setLoading(null);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    blurActiveField();
    setError(null);
    setMessage(null);

    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!accepted) {
      setError("Debes confirmar que eres una persona adulta o entidad responsable.");
      return;
    }

    const isUsernameAvailable = await checkUsernameAvailability(displayName);
    if (!isUsernameAvailable) {
      setError("El nombre de usuario no está disponible o no cumple el formato.");
      return;
    }

    setLoading("register");
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: registerEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        data: {
          display_name: displayName,
          role: profileRoleForSelection(userType, subtype)
        }
      }
    });

    try {
      if (signUpError) throw signUpError;
      if (data.user && data.session) {
        await createOrUpdateProfile(data.user.id);
        router.push(redirectTo);
        router.refresh();
        return;
      }
      setMessage("Cuenta creada. Revisa tu email para confirmar el acceso antes de entrar en Tenlo.");
    } catch (err) {
      setError(isDuplicatePublicNameError(err) ? "Ese nombre de usuario ya está en uso." : err instanceof Error ? err.message : "No hemos podido crear la cuenta.");
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogleLogin() {
    blurActiveField();
    setError(null);
    setMessage(null);
    setLoading("google");
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
      }
    });

    if (googleError) {
      setError(googleError.message);
      setLoading(null);
    }
  }

  return (
    <div className="page py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-2xl border border-line bg-panel p-5 md:p-8">
          <h1 className="detail-title text-ink">Entrar o registrarse</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            El perfil representa a una persona adulta, una entidad o un centro. No se solicitan fotos, horarios personales, clases ni datos identificativos de menores.
          </p>

          <div className="mt-6 rounded-2xl border border-line bg-soft p-4">
            <h2 className="text-base font-bold text-slatecopy">¿Ya tienes cuenta?</h2>
            <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={handleLogin}>
              <label className="sr-only" htmlFor="login-email">Email</label>
              <input id="login-email" type="email" required className="field m-0 placeholder:text-muted" placeholder="Email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} />
              <label className="sr-only" htmlFor="login-password">Contraseña</label>
              <div className="relative">
                <input id="login-password" type={showLoginPassword ? "text" : "password"} required className="field m-0 pr-12 placeholder:text-muted" placeholder="Contraseña" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 my-auto inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
                  onClick={() => setShowLoginPassword((visible) => !visible)}
                  aria-label={showLoginPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showLoginPassword}
                >
                  {showLoginPassword ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
                </button>
              </div>
              <button className="btn-secondary" type="submit" disabled={loading === "login"}>{loading === "login" ? "Entrando..." : "Entrar"}</button>
            </form>
            <button className="btn-primary mt-3 w-full justify-center" type="button" onClick={handleGoogleLogin} disabled={loading === "google"}>
              {loading === "google" ? "Conectando..." : "Continuar con Google"}
            </button>
          </div>

          {error ? <p className="mt-4 rounded-xl border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral">{error}</p> : null}
          {message ? <p className="mt-4 rounded-xl border border-sage/30 bg-sage/10 p-3 text-sm font-semibold text-petrol">{message}</p> : null}

          <form className="mt-6 grid gap-5" onSubmit={handleRegister}>
            <section className="rounded-2xl border border-line bg-white p-4">
              <label className="field-label">
                Tipo de usuario
                <select required className="field" value={userType} onChange={(event) => handleTypeChange(event.target.value as UserTypeId)}>
                  {userTypes.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}
                </select>
              </label>
              <div className="mt-4 flex gap-3 rounded-2xl bg-soft p-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-ink ring-1 ring-line"><Icon size={22} aria-hidden /></span>
                <div>
                  <h2 className="text-base font-bold text-slatecopy">{current.label}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">{current.helper}</p>
                  {showBusinessFields && (
                    <p className="mt-2 text-sm font-semibold leading-6 text-petrol">
                      Revisaremos tu alta antes de activar la cuenta. Te avisaremos por email o teléfono si queda aprobada o necesitamos más información.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-4 rounded-2xl border border-line bg-white p-4 md:grid-cols-2">
              <label className="field-label md:col-span-2">
                {showBusinessFields ? "Nombre público de la entidad o profesional" : "Nombre usuario"}
                <input
                  required
                  className="field font-normal placeholder:text-muted"
                  placeholder={showBusinessFields ? "Ej. Academia Norte, Colegio Los Olivos" : "Ej. Marta G."}
                  value={displayName}
                  onChange={(event) => {
                    setDisplayName(event.target.value);
                    setUsernameStatus("idle");
                  }}
                  onBlur={() => {
                    if (displayName.trim()) void checkUsernameAvailability(displayName);
                  }}
                  aria-describedby="username-availability"
                />
                <span id="username-availability" className={`mt-2 block text-sm font-semibold ${usernameStatus === "available" ? "text-petrol" : usernameStatus === "taken" || usernameStatus === "invalid" ? "text-coral" : "text-muted"}`}>
                  {usernameStatus === "checking" && "Comprobando disponibilidad..."}
                  {usernameStatus === "available" && "Nombre usuario disponible."}
                  {usernameStatus === "taken" && "Ese nombre usuario ya está en uso."}
                  {usernameStatus === "invalid" && "Usa entre 3 y 40 caracteres: letras, números, espacios, punto, guion o guion bajo."}
                  {usernameStatus === "unknown" && "No hemos podido comprobarlo ahora. Lo validaremos al crear la cuenta."}
                </span>
              </label>
              <label className="field-label">Email de contacto<input required type="email" className="field font-normal placeholder:text-muted" placeholder="tu@email.com" value={registerEmail} onChange={(event) => setRegisterEmail(event.target.value)} /></label>
              <label className="field-label">Teléfono de contacto<input type="tel" className="field font-normal placeholder:text-muted" placeholder="Teléfono de contacto" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
              <div className="field-label">
                <label htmlFor="register-password">Contraseña</label>
                <div className="relative mt-2">
                  <input id="register-password" required type={showPassword ? "text" : "password"} minLength={8} className="field m-0 pr-12 font-normal placeholder:text-muted" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 8 caracteres" />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 my-auto inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
                  </button>
                </div>
              </div>
              <div className="field-label">
                <label htmlFor="register-password-confirm">Confirmar contraseña</label>
                <div className="relative mt-2">
                  <input id="register-password-confirm" required type={showPasswordConfirm ? "text" : "password"} minLength={8} className="field m-0 pr-12 font-normal placeholder:text-muted" value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} aria-invalid={passwordMismatch} placeholder="Repite la contraseña" />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 my-auto inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
                    onClick={() => setShowPasswordConfirm((visible) => !visible)}
                    aria-label={showPasswordConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                    aria-pressed={showPasswordConfirm}
                  >
                    {showPasswordConfirm ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
                  </button>
                </div>
                {passwordMismatch && <span className="mt-2 block text-sm font-semibold text-coral">Las contraseñas no coinciden.</span>}
              </div>
              <label className="field-label">
                Municipio principal
                <select required className="field" value={municipality} onChange={(event) => setMunicipality(event.target.value)}>
                  <option value="" disabled>Selecciona municipio</option>
                  {municipalities.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
              </label>
              <label className="field-label">
                Centro relacionado opcional
                <select className="field" defaultValue="">
                  <option value="">No indicado</option>
                  {centers.map((c) => <option key={c.id}>{c.name}</option>)}
                </select>
              </label>
            </section>

            {showBusinessFields && (
              <section className="grid gap-4 rounded-2xl border border-line bg-white p-4 md:grid-cols-2">
                <label className="field-label">
                  Tipología
                  <select required className="field" value={subtype} onChange={(event) => setSubtype(event.target.value)}>
                    {subtypeOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label className="field-label">Web o enlace público<input className="field font-normal placeholder:text-muted" placeholder="https://" /></label>
                <label className="field-label md:col-span-2">Descripción breve<textarea required className="field min-h-28 py-3 font-normal placeholder:text-muted" placeholder={showChildcareFields ? "Preséntate en primera persona: cómo trabajas, qué rutinas acompañas y en qué zona puedes ayudar." : "Cuenta qué ofreces, para quién y en qué zona trabajas."} /></label>
                <label className="field-label">Dirección o zona de servicio<input className="field font-normal placeholder:text-muted" placeholder="Ej. Majadahonda y alrededores" /></label>
                <label className="field-label">Modalidad<select className="field" defaultValue=""><option value="">Selecciona modalidad</option><option>Presencial</option><option>Online</option><option>Presencial y online</option><option>A domicilio</option></select></label>
                {showAgeAndAvailability && (
                  <>
                    <label className="field-label">Edades orientativas<input className="field font-normal placeholder:text-muted" placeholder={showChildcareFields ? "Ej. Infantil y Primaria, 3-12 años" : "Ej. 6-12 años, familias, adultos"} /></label>
                    <label className="field-label">Disponibilidad<input className="field font-normal placeholder:text-muted" placeholder={showChildcareFields ? "Ej. tardes entre semana, noches puntuales" : "Ej. tardes, fines de semana, vacaciones"} /></label>
                    <label className="field-label md:col-span-2">Horarios o franjas<textarea className="field min-h-24 py-3 font-normal placeholder:text-muted" placeholder={showChildcareFields ? "Ej. Lu tarde; Ma tarde; Mi consultar; Ju tarde; Vi noche; Sa mañana; Do sin servicio." : "Indica horarios de apertura, clases, turnos o disponibilidad sin incluir horarios personales de menores."} /></label>
                  </>
                )}
                {showChildcareFields && (
                  <>
                    <label className="field-label">Tarifa por hora<input className="field font-normal placeholder:text-muted" placeholder="Ej. 12 €/hora" /></label>
                    <label className="field-label">Preaviso para confirmar<input className="field font-normal placeholder:text-muted" placeholder="Ej. 24 h, 48 h" /></label>
                    <label className="field-label">Tipo de cuidado<select className="field" defaultValue=""><option value="">Selecciona tipo</option><option>Ocasional</option><option>Regular</option><option>Después del colegio</option><option>Noches puntuales</option><option>Fines de semana</option></select></label>
                    <label className="field-label">Verificaciones disponibles<select className="field" defaultValue=""><option value="">Pendiente de validar</option><option>Identidad verificable</option><option>Referencias disponibles</option><option>Formación relacionada</option><option>Certificado aportable</option></select></label>
                    <label className="field-label md:col-span-2">Experiencia, referencias y preferencias<textarea className="field min-h-24 py-3 font-normal placeholder:text-muted" placeholder="Años de experiencia, edades con las que trabajas, idiomas, apoyo con deberes, rutinas y referencias que podrás aportar." /></label>
                  </>
                )}
                {showCredentials && (
                  <>
                    <label className="field-label">Licencia, colegiación o autorización aplicable<input className="field font-normal placeholder:text-muted" placeholder="Ej. nº colegiado, autorización, licencia municipal" /></label>
                    <label className="field-label">Seguro o responsable del servicio<input className="field font-normal placeholder:text-muted" placeholder="Ej. entidad responsable, póliza, titular del servicio" /></label>
                  </>
                )}
                <label className="field-label md:col-span-2">Características relevantes<textarea className="field min-h-24 py-3 font-normal placeholder:text-muted" placeholder="Idiomas, grupos reducidos, recogida, necesidades especiales, materiales, ratios, etc." /></label>
              </section>
            )}

            {showMinorSafety && (
              <div className="rounded-2xl border border-sage/30 bg-sage/10 p-4 text-sm leading-6 text-slatecopy">
                <strong className="block text-petrol">Aviso de seguridad para servicios personales</strong>
                En este MVP solo aceptamos altas gestionadas por adultos o entidades responsables. Tenlo no emplea, contrata ni valida laboralmente a canguros o profesores: publica fichas revisadas y facilita el descubrimiento. Si una actividad la realiza una persona menor de edad, no se publicará su perfil ni sus datos de contacto; deberá estar gestionada por una persona adulta responsable y cumplir la normativa aplicable.
              </div>
            )}

            <label className="rounded-xl border border-line bg-soft p-4 text-sm font-semibold leading-6 text-slatecopy">
              <input required type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mr-2 h-4 w-4 rounded border-line" />
              Confirmo que soy mayor de 18 años o actúo en nombre de una entidad responsable, y que la información no incluye datos personales, fotos ni horarios identificativos de menores.
            </label>
            <button className="btn-primary w-full md:w-fit" type="submit" disabled={passwordMismatch || loading === "register"}>{loading === "register" ? "Creando cuenta..." : "Crear cuenta"}</button>
          </form>
        </div>

        <aside className="rounded-2xl border border-line bg-panel p-5 md:p-6">
          <h2 className="text-xl font-semibold text-ink">Así se verá tu perfil</h2>
          <div className="mt-5 grid gap-3">
            {roleExamples.map(({ title, text, Icon: ExampleIcon, className }) => (
              <div key={title} className="flex items-center gap-3 rounded-xl border border-line bg-soft p-4">
                <span className={`grid h-11 w-11 place-items-center rounded-full ring-1 ${className}`}>
                  <ExampleIcon size={20} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{title}</p>
                  <p className="text-sm font-medium text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-muted">
            El rol aparecerá en publicaciones, solicitudes y fichas para distinguir familias, profesionales, servicios y centros sin crear perfiles de menores.
          </p>
        </aside>
      </div>
    </div>
  );
}
