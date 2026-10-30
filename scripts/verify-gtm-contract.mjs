import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-KT8CKRPK";
const analyticsSource = await readFile(new URL("../src/lib/analytics.ts", import.meta.url), "utf8");
const unionBlock = analyticsSource.match(/export type TrackingAction =([\s\S]*?);/);
assert(unionBlock, "No se ha encontrado la unión TrackingAction.");
const appEvents = [...unionBlock[1].matchAll(/"([a-z0-9_]+)"/g)].map((match) => match[1]);
assert(appEvents.length >= 50, "TrackingAction debe conservar la taxonomía completa de producto.");

const response = await fetch(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`, {
  headers: { "cache-control": "no-cache" }
});
assert(response.ok, `GTM respondió ${response.status}.`);
const container = await response.text();
assert(container.includes("G-FDTX9QB5EG"), "El contenedor publicado no incluye la etiqueta base de GA4 de Tenlo.");
assert(container.includes("analytics_consent_granted"), "La etiqueta base de GA4 no espera la concesión de consentimiento.");
assert(container.includes("tenlo_gtm_disabled"), "El activador genérico debe permanecer deshabilitado para evitar duplicados.");
assert(analyticsSource.includes('window.gtag?.("event", event'), "La capa central no envía los eventos saneados a gtag.");
assert(analyticsSource.includes("send_to: ga4MeasurementId"), "La capa central no declara el destino GA4 explícito.");
assert(analyticsSource.includes("sanitizeTrackingEntries"), "La capa central debe sanear parámetros antes del envío.");

console.log(`OK GTM ${gtmId}: carga consentida, destino GA4 y envío central saneado sin activador genérico duplicado.`);
