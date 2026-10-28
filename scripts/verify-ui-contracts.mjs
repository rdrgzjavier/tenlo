import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [loginRegistration, passwordReset, accountSettings, invitationSetup, providerSections, servicePage, centerPage] = await Promise.all([
  read("src/components/LoginRegistration.tsx"),
  read("src/components/PasswordResetForm.tsx"),
  read("src/components/AccountSettings.tsx"),
  read("src/components/InvitationSetupForm.tsx"),
  read("src/components/ProviderProfileSections.tsx"),
  read("src/app/servicios/[id]/page.tsx"),
  read("src/app/centros/[slug]/page.tsx")
]);

const checks = [
  [loginRegistration.includes('autoComplete="current-password"'), "El acceso debe identificar la contraseña actual para gestores de contraseñas."],
  [(loginRegistration.match(/autoComplete="new-password"/g) || []).length >= 2, "El registro debe identificar ambos campos de contraseña nueva."],
  [(passwordReset.match(/autoComplete="new-password"/g) || []).length >= 2, "El restablecimiento debe identificar ambos campos de contraseña nueva."],
  [accountSettings.includes('autoComplete="current-password"'), "El área personal debe identificar la contraseña actual."],
  [(accountSettings.match(/autoComplete="new-password"/g) || []).length >= 2, "El área personal debe identificar ambos campos de contraseña nueva."],
  [(invitationSetup.match(/autoComplete="new-password"/g) || []).length >= 2, "La activación de invitaciones debe identificar ambos campos de contraseña nueva."],
  [providerSections.includes("href={`tel:${phone}`}"), "La información específica del proveedor debe permitir llamar."],
  [servicePage.includes("href={`tel:${provider.phone.replace(/\\s/g, \"\")}`}"), "La ficha de servicio debe permitir llamar."],
  [centerPage.includes("href={`tel:${center.phone.replace(/\\s/g, \"\")}`}"), "La ficha de centro debe permitir llamar."]
];

for (const [condition, message] of checks) {
  assert(condition, message);
  console.log(`OK ${message}`);
}
