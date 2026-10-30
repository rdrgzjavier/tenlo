import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-KT8CKRPK";
const analyticsSource = await readFile(new URL("../src/lib/analytics.ts", import.meta.url), "utf8");
const unionBlock = analyticsSource.match(/export type TrackingAction =([\s\S]*?);/);
assert(unionBlock, "No se ha encontrado la unión TrackingAction.");

const appEvents = [...unionBlock[1].matchAll(/"([a-z0-9_]+)"/g)].map((match) => match[1]);
assert(appEvents.length > 0, "TrackingAction no contiene eventos.");

const response = await fetch(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`, {
  headers: { "cache-control": "no-cache" }
});
assert(response.ok, `GTM respondió ${response.status}.`);
const container = await response.text();
const allowlist = container.match(/[a-z][a-z0-9_]+(?:\|[a-z][a-z0-9_]+){10,}/g)
  ?.map((candidate) => candidate.split("|"))
  .find((candidate) => candidate.includes("page_view") && candidate.includes("result_opened"));

assert(allowlist, "No se ha podido localizar la lista publicada de eventos Tenlo en GTM.");
const missing = appEvents.filter((event) => !allowlist.includes(event));
const unknown = allowlist.filter((event) => !appEvents.includes(event));

assert.equal(missing.length, 0, `Eventos de la aplicación ausentes en GTM: ${missing.join(", ")}`);
assert.equal(unknown.length, 0, `Eventos publicados en GTM ausentes de TrackingAction: ${unknown.join(", ")}`);
console.log(`OK GTM ${gtmId}: ${allowlist.length} eventos publicados y sincronizados con TrackingAction.`);
