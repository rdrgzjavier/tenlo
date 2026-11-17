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

console.log(`OK ${appFiles.length} archivos de aplicación no elevan automáticamente la confianza.`);
console.log("OK Las cargas con fuente pública permanecen collected y los privilegios de confianza se verifican por SQL.");
