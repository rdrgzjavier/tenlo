import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const exportPath = process.argv[2];

if (!exportPath) {
  console.error("Uso: npm run verify:account-export -- <ruta-al-json>");
  process.exit(2);
}

const raw = await readFile(exportPath, "utf8");
const data = JSON.parse(raw);
const forbiddenKeyPaths = [];
const emails = new Set();
const forbiddenKeyPattern = /password|token|secret|session|service_role|access_key|ip_address/i;
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function inspect(value, path = "") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspect(item, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => {
      const childPath = path ? `${path}.${key}` : key;
      if (forbiddenKeyPattern.test(key)) forbiddenKeyPaths.push(childPath);
      inspect(child, childPath);
    });
    return;
  }
  if (typeof value === "string") {
    for (const match of value.matchAll(emailPattern)) emails.add(match[0].toLowerCase());
  }
}

inspect(data);

assert.equal(typeof data.export_version, "string", "Falta la versión de la exportación.");
assert.equal(typeof data.exported_at, "string", "Falta la fecha de generación.");
assert.ok(data.account && typeof data.account === "object", "Falta el bloque de cuenta.");
assert.ok(data.profile && typeof data.profile === "object", "Falta el bloque de perfil.");
for (const collection of ["business_profiles", "favorites", "saved_searches", "submissions", "connection_requests", "connection_feedback", "claim_requests", "consent_history", "search_history"]) {
  assert.ok(Array.isArray(data[collection]), `La colección ${collection} no es una lista.`);
}
assert.deepEqual(forbiddenKeyPaths, [], `La exportación contiene campos sensibles inesperados: ${forbiddenKeyPaths.join(", ")}`);
assert.ok(emails.size <= 1, "La exportación contiene emails de más de una identidad.");

const fileInfo = await stat(exportPath);
console.log(`OK Exportación ${data.export_version}: ${fileInfo.size} bytes, ${emails.size} identidad de email y ningún campo secreto.`);
