import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [loginRegistration, passwordRecovery, passwordReset, accountSettings, invitationSetup, turnstileChallenge, providerSections, servicePage, centerPage, performanceReport, providerReport, searchPage, savedSearchPage, savedSearchButton, providerSuggestionForm, adminPage] = await Promise.all([
  read("src/components/LoginRegistration.tsx"),
  read("src/components/PasswordRecoveryRequest.tsx"),
  read("src/components/PasswordResetForm.tsx"),
  read("src/components/AccountSettings.tsx"),
  read("src/components/InvitationSetupForm.tsx"),
  read("src/components/TurnstileChallenge.tsx"),
  read("src/components/ProviderProfileSections.tsx"),
  read("src/app/servicios/[id]/page.tsx"),
  read("src/app/centros/[slug]/page.tsx"),
  read("src/app/admin/rendimiento/page.tsx"),
  read("src/app/admin/proveedores/page.tsx"),
  read("src/app/buscar/page.tsx"),
  read("src/app/busquedas-guardadas/page.tsx"),
  read("src/components/SaveSearchButton.tsx"),
  read("src/components/ProviderSuggestionForm.tsx"),
  read("src/app/admin/page.tsx")
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
  [(invitationSetup.match(/autoComplete="new-password"/g) || []).length >= 2, "La activación de invitaciones debe identificar ambos campos de contraseña nueva."],
  [providerSections.includes("href={`tel:${phone}`}"), "La información específica del proveedor debe permitir llamar."],
  [servicePage.includes("href={`tel:${provider.phone.replace(/\\s/g, \"\")}`}"), "La ficha de servicio debe permitir llamar."],
  [centerPage.includes("href={`tel:${center.phone.replace(/\\s/g, \"\")}`}"), "La ficha de centro debe permitir llamar."],
  [performanceReport.includes('{ name: "claim", label: "Reclamación"') && performanceReport.includes('.select("id,external_key,claim_status")'), "El informe de rendimiento debe filtrar por reclamación usando el estado privado de la ficha."],
  [providerReport.includes("Activas 30 d") && providerReport.includes("active30OwnerIds"), "El informe de proveedores debe separar oferta publicada, disponible y activa por segmento."],
  [searchPage.includes("<SaveSearchButton") && savedSearchButton.includes('.from("saved_searches").upsert'), "El buscador debe permitir guardar criterios persistentes tras autenticar al usuario."],
  [savedSearchPage.includes('.from("saved_searches")') && savedSearchPage.includes("<SavedSearchActions"), "El área privada debe permitir recuperar y gestionar búsquedas guardadas."],
  [providerSuggestionForm.includes('fetch("/api/provider-suggestion"') && adminPage.includes("<AdminProviderSuggestionReview"), "Las propuestas de proveedor deben quedar estructuradas y exigir revisión administrativa antes de crear una ficha."]
];

for (const [condition, message] of checks) {
  assert(condition, message);
  console.log(`OK ${message}`);
}
