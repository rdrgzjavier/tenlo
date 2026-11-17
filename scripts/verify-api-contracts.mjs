import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const routeFiles = execFileSync("git", ["ls-files", "src/app/api/**/route.ts"], { encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);

const postRoutes = [];
for (const path of routeFiles) {
  const source = await readFile(path, "utf8");
  if (!source.includes("export async function POST")) continue;
  postRoutes.push(path);
  assert(
    source.includes('request.headers.get("content-type")?.includes("application/json")'),
    `${path} debe rechazar cuerpos POST con un tipo de contenido inesperado.`
  );
}

assert(postRoutes.length >= 15, "La auditoría debe cubrir el conjunto esperado de endpoints POST.");

const claim = await readFile("src/app/api/claim/route.ts", "utf8");
const claimForm = await readFile("src/components/ClaimProfileForm.tsx", "utf8");
assert(claim.includes('new Set(["center", "provider", "community"])'), "Las reclamaciones deben limitar el tipo de ficha.");
assert(claimForm.includes("adultConfirmation: accepted") && claim.includes("data.adultConfirmation !== true"), "La declaración adulta de la reclamación debe viajar al servidor y validarse allí.");
assert(claim.includes("allowedRoles.has(payload.role_description)"), "La relación profesional declarada debe pertenecer a la lista permitida.");
assert(claim.includes('value("corrections", 5000)') && claim.includes('value("officialWebsite", 500)'), "Las reclamaciones deben limitar los campos libres y las URL.");
assert(claim.includes("/^https?:\\/\\/[^\\s]+$/i.test(payload.official_website)"), "Las reclamaciones deben validar la web oficial en el servidor.");

console.log(`OK ${postRoutes.length} endpoints POST exigen JSON.`);
console.log("OK Las reclamaciones validan declaración adulta, relación, tipos, longitudes y URL en el servidor.");
