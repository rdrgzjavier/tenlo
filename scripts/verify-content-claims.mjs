import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const files = execFileSync("git", ["ls-files", "src/app/**/*.tsx", "src/components/**/*.tsx"], { encoding: "utf8" })
  .split(/\r?\n/)
  .filter((path) => path && !path.includes("/admin/"));

const forbiddenClaims = [
  /familias? esperando/i,
  /clientes? esperando/i,
  /miles de familias/i,
  /cientos de familias/i,
  /demanda asegurada/i,
  /contactos? garantizados?/i,
  /contrataciones? garantizadas?/i,
  /resultados? garantizados?/i,
  /somos (?:el|la) l[ií]der/i,
  /n[uú]mero uno/i
];

for (const path of files) {
  const source = await readFile(path, "utf8");
  for (const claim of forbiddenClaims) {
    assert(!claim.test(source), `${path} contiene una afirmación comercial no demostrada: ${claim}`);
  }
}

console.log(`OK ${files.length} superficies públicas sin demanda ficticia ni resultados garantizados.`);
