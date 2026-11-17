import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const seedBuilder = await readFile("scripts/build-directory-seed.ts", "utf8");
assert(
  (seedBuilder.match(/trust_level = 'collected'/g) || []).length >= 3,
  "Las cargas editoriales deben mantener confianza collected aunque exista una fuente oficial."
);
assert(
  !/source_url[\s\S]{0,120}trust_level\s*=\s*'(verified|official)'/i.test(seedBuilder),
  "Una URL de fuente no puede elevar automáticamente la confianza."
);

const appFiles = execFileSync("git", ["ls-files", "src/**/*.ts", "src/**/*.tsx"], { encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);

for (const path of appFiles) {
  const source = await readFile(path, "utf8");
  assert(
    !/\.update\s*\(\s*\{[^}]*trust_level/s.test(source),
    `${path} no debe permitir elevar trust_level desde un flujo ordinario de la aplicación.`
  );
}

const privilegeVerification = await readFile("supabase/verification/0024_0025_directory_controls.sql", "utf8");
assert(
  privilegeVerification.includes("can_update_business_trust") && privilegeVerification.includes("can_update_service_trust"),
  "La verificación SQL debe comprobar que las cuentas normales no pueden editar la confianza."
);

const ownerHardening = await readFile("supabase/migrations/0027_owner_moderation_hardening.sql", "utf8");
const directoryRepository = await readFile("src/lib/directory-repository.ts", "utf8");
const searchPage = await readFile("src/app/buscar/page.tsx", "utf8");
assert(
  ownerHardening.includes("trust_level = 'collected'") && ownerHardening.includes("commercial_plan = 'free'"),
  "Las actualizaciones del titular deben mantener separados confianza y plan comercial."
);
assert(
  directoryRepository.includes("trustLevel: row.trust_level") && directoryRepository.includes("plan: row.commercial_plan"),
  "El directorio debe modelar confianza y plan como dimensiones independientes."
);
assert(
  searchPage.includes("El plan comercial y el nivel de confianza no compran una mejor posición"),
  "El buscador debe declarar que el pago no altera la posición orgánica."
);

console.log(`OK ${appFiles.length} archivos de aplicación no elevan automáticamente la confianza.`);
console.log("OK Las cargas con fuente pública permanecen collected y los privilegios de confianza se verifican por SQL.");
console.log("OK El plan comercial permanece separado de confianza y orden orgánico.");
