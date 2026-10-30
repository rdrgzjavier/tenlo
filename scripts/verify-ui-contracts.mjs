import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [loginRegistration, passwordRecovery, passwordReset, accountSettings, internalAnalyticsControl, consentBanner, consentSettings, consentMode, consentLibrary, analyticsLibrary, directoryEventRoute, invitationSetup, turnstileChallenge, providerSections, servicePage, centerPage, performanceReport, providerReport, providerPrivateReport, printableProviderReport, connectionWorkflow, searchPage, savedSearchPage, savedSearchButton, providerSuggestionForm, adminPage, validatedSearchForm] = await Promise.all([
  read("src/components/LoginRegistration.tsx"),
  read("src/components/PasswordRecoveryRequest.tsx"),
  read("src/components/PasswordResetForm.tsx"),
  read("src/components/AccountSettings.tsx"),
  read("src/components/InternalAnalyticsControl.tsx"),
  read("src/components/ConsentBanner.tsx"),
  read("src/components/CookieSettingsButton.tsx"),
  read("src/components/ConsentMode.tsx"),
  read("src/lib/consent.ts"),
  read("src/lib/analytics.ts"),
  read("src/app/api/analytics/directory-event/route.ts"),
  read("src/components/InvitationSetupForm.tsx"),
  read("src/components/TurnstileChallenge.tsx"),
  read("src/components/ProviderProfileSections.tsx"),
  read("src/app/servicios/[id]/page.tsx"),
  read("src/app/centros/[slug]/page.tsx"),
  read("src/app/admin/rendimiento/page.tsx"),
  read("src/app/admin/proveedores/page.tsx"),
  read("src/app/solicitudes-profesionales/page.tsx"),
  read("src/app/rendimiento-profesional/page.tsx"),
  read("src/components/ConnectionWorkflow.tsx"),
  read("src/app/buscar/page.tsx"),
  read("src/app/busquedas-guardadas/page.tsx"),
  read("src/components/SaveSearchButton.tsx"),
  read("src/components/ProviderSuggestionForm.tsx"),
  read("src/app/admin/page.tsx"),
  read("src/components/ValidatedSearchForm.tsx")
]);

const checks = [
  [loginRegistration.includes('autoComplete="current-password"'), "El acceso debe identificar la contraseña actual para gestores de contraseñas."],
  [(loginRegistration.match(/autoComplete="new-password"/g) || []).length >= 2, "El registro debe identificar ambos campos de contraseña nueva."],
  [loginRegistration.includes('name="registration_middle_name"') && loginRegistration.includes('failure_reason: "honeypot_filled"'), "El registro debe conservar la primera barrera antiabuso medible."],
  [loginRegistration.includes("captchaToken: loginCaptchaToken") && loginRegistration.includes("captchaToken: registerCaptchaToken"), "Acceso y registro deben enviar el token CAPTCHA cuando esté configurado."],
  [passwordRecovery.includes("captchaToken: captchaToken"), "La recuperación debe enviar el token CAPTCHA cuando esté configurado."],
  [turnstileChallenge.includes("NEXT_PUBLIC_TURNSTILE_SITE_KEY") && turnstileChallenge.includes("challenges.cloudflare.com/turnstile"), "Turnstile debe permanecer opcional y usar el servicio oficial."],
  [(passwordReset.match(/autoComplete="new-password"/g) || []).length >= 2, "El restablecimiento debe identificar ambos campos de contraseña nueva."],
  [accountSettings.includes('autoComplete="current-password"'), "El área personal debe identificar la contraseña actual."],
  [(accountSettings.match(/autoComplete="new-password"/g) || []).length >= 2, "El área personal debe identificar ambos campos de contraseña nueva."],
  [internalAnalyticsControl.includes("tenlo_internal_traffic") && analyticsLibrary.includes("!isInternalAnalyticsTraffic()") && directoryEventRoute.includes("excluded: true"), "La exclusión de tráfico interno debe bloquear analítica en cliente y servidor."],
  [directoryEventRoute.includes('tenlo_analytics_consent=accepted') && directoryEventRoute.includes('.from("directory_events").insert(events)'), "La persistencia propia debe exigir consentimiento y limitarse a INSERT bajo RLS."],
  [consentBanner.includes('choose("rejected")') && consentBanner.includes('choose("accepted")'), "El consentimiento debe permitir rechazar o aceptar la analítica sin publicidad."],
  [consentBanner.includes("Configurar") && consentBanner.includes("Guardar selección") && consentBanner.includes("Permitir cookies analíticas"), "La primera capa debe ofrecer configuración directa y el panel debe guardar una selección granular."],
  [consentSettings.includes("Estado actual") && consentSettings.includes("analyticsConsentChangedEvent"), "El gestor debe mostrar y actualizar la preferencia de consentimiento vigente."],
  [consentMode.includes('readAnalyticsConsent() === "accepted"') && consentMode.includes('analytics_storage: analyticsGranted ? "granted" : "denied"'), "GTM y GA4 deben permanecer denegados hasta recibir consentimiento estadístico."],
  [consentMode.includes("window.__tenloAnalyticsReady = true") && analyticsLibrary.includes("window.__tenloAnalyticsReady === true"), "Los eventos de producto deben esperar a que la etiqueta base de GA4 esté preparada."],
  [validatedSearchForm.includes("event.preventDefault()") && validatedSearchForm.includes("window.setTimeout(() => form.submit(), 120)"), "Los eventos de búsqueda deben procesarse antes de abandonar la página."],
  [consentLibrary.includes("Max-Age=31536000") && consentLibrary.includes("SameSite=Lax; Secure") && consentLibrary.includes('name === "_ga"'), "La preferencia propia debe ser limitada, segura y retirar cookies de GA al rechazar."],
  [(invitationSetup.match(/autoComplete="new-password"/g) || []).length >= 2, "La activación de invitaciones debe identificar ambos campos de contraseña nueva."],
  [providerSections.includes("href={`tel:${phone}`}"), "La información específica del proveedor debe permitir llamar."],
  [servicePage.includes("href={`tel:${provider.phone.replace(/\\s/g, \"\")}`}"), "La ficha de servicio debe permitir llamar."],
  [centerPage.includes("href={`tel:${center.phone.replace(/\\s/g, \"\")}`}"), "La ficha de centro debe permitir llamar."],
  [performanceReport.includes('{ name: "claim", label: "Reclamación"') && performanceReport.includes('.select("id,external_key,claim_status")'), "El informe de rendimiento debe filtrar por reclamación usando el estado privado de la ficha."],
  [providerReport.includes("Activas 30 d") && providerReport.includes("active30OwnerIds"), "El informe de proveedores debe separar oferta publicada, disponible y activa por segmento."],
  [providerPrivateReport.includes('rpc("get_provider_private_performance"') && providerPrivateReport.includes("30 días anteriores"), "El proveedor debe ver rendimiento privado y una comparación temporal sin datos familiares."],
  [printableProviderReport.includes("<PrintProviderReportButton") && printableProviderReport.includes("Cómo interpretar este informe"), "El informe compartible del proveedor debe ser agregado, imprimible y explicar los límites de las métricas."],
  [connectionWorkflow.includes('fetch("/api/admin/connection-remind"') && connectionWorkflow.includes("providerRemindedAt"), "El backoffice debe ofrecer un único recordatorio auditable sin sustituir el seguimiento de alternativas."],
  [searchPage.includes("<SaveSearchButton") && savedSearchButton.includes('.from("saved_searches").upsert'), "El buscador debe permitir guardar criterios persistentes tras autenticar al usuario."],
  [savedSearchPage.includes('.from("saved_searches")') && savedSearchPage.includes("<SavedSearchActions"), "El área privada debe permitir recuperar y gestionar búsquedas guardadas."],
  [providerSuggestionForm.includes('fetch("/api/provider-suggestion"') && adminPage.includes("<AdminProviderSuggestionReview"), "Las propuestas de proveedor deben quedar estructuradas y exigir revisión administrativa antes de crear una ficha."]
];

for (const [condition, message] of checks) {
  assert(condition, message);
  console.log(`OK ${message}`);
}
