const baseUrl = (process.env.TENLO_BASE_URL || "https://tenlo.es").replace(/\/$/, "");

const publicChecks = [
  ["/", ["Encuentra, compara y contacta", "+21", "+37"]],
  ["/centros", ["Centros educativos"]],
  ["/centros/ceip-agora-boadilla", ["CEIP Ágora"]],
  ["/servicios", ["Servicios para familias"]],
  ["/servicios/centro-cultural-volturno-pozuelo", ["Centro Cultural Volturno"]],
  ["/servicios/boadilla-beone", ["BeOne Boadilla", "href=\"tel:916327361\""]],
  ["/buscar?municipio=Majadahonda", ["Majadahonda"]],
  ["/login", ["Iniciar sesión"]],
  ["/contacto", ["solicitudes@tenlo.es", "mailto:solicitudes@tenlo.es"]],
  ["/privacidad", ["solicitudes@tenlo.es"]],
  ["/aviso-legal", ["solicitudes@tenlo.es"]],
  ["/auth/confirmar?token_hash=smoke-test&type=recovery&next=/restablecer-contrasena", ["Restablece tu contraseña", "Continuar de forma segura"]],
  ["/sitemap.xml", ["/centros/ceip-agora-boadilla", "/servicios/centro-cultural-volturno-pozuelo"]],
  ["/robots.txt", ["Sitemap: https://tenlo.es/sitemap.xml", "Disallow: /admin/"]],
  ["/llms.txt", ["# Tenlo", "[Buscar en Tenlo](https://tenlo.es/buscar)", "## Límites de uso"]]
];

let failed = false;
const securityHeaders = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "SAMEORIGIN",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "cross-origin-opener-policy": "same-origin-allow-popups"
};
const forbiddenTexts = {
  "/aviso-legal": ["[Nombre del Titular/Empresa]", "[NIF]", "[Dirección Completa]"],
  "/privacidad": ["[Nombre del Titular]"]
};

for (const [path, expectedTexts] of publicChecks) {
  const response = await fetch(`${baseUrl}${path}`, { headers: { "User-Agent": "Tenlo production smoke check" } });
  const body = await response.text();
  const missing = expectedTexts.filter((text) => !body.includes(text));
  const forbiddenPresent = (forbiddenTexts[path] || []).filter((text) => body.includes(text));
  const missingSecurityHeaders = Object.entries(securityHeaders).filter(([name, value]) => response.headers.get(name) !== value).map(([name]) => name);
  if (!response.headers.get("strict-transport-security")?.includes("max-age=")) missingSecurityHeaders.push("strict-transport-security");
  const contentTypeOk = path !== "/llms.txt" || response.headers.get("content-type")?.includes("text/markdown");
  const ok = response.status === 200 && missing.length === 0 && forbiddenPresent.length === 0 && contentTypeOk && missingSecurityHeaders.length === 0;
  console.log(`${ok ? "OK" : "FAIL"} ${response.status} ${path}${missing.length ? ` · faltan: ${missing.join(", ")}` : ""}${forbiddenPresent.length ? ` · marcadores provisionales: ${forbiddenPresent.join(", ")}` : ""}${contentTypeOk ? "" : " · Content-Type no es text/markdown"}${missingSecurityHeaders.length ? ` · cabeceras ausentes: ${missingSecurityHeaders.join(", ")}` : ""}`);
  failed ||= !ok;
}

const intentionallyAbsentPublicPaths = ["/llms-full.txt"];

for (const path of intentionallyAbsentPublicPaths) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  const ok = response.status === 404;
  console.log(`${ok ? "OK" : "FAIL"} ${response.status} ${path} · exportación masiva no publicada`);
  failed ||= !ok;
}

const protectedPaths = [
  "/admin",
  "/admin/demanda?period=30",
  "/admin/demanda?period=90&category=extraescolares&municipality=Majadahonda",
  "/admin/rendimiento",
  "/admin/rendimiento?period=180",
  "/admin/rendimiento?period=90&category=centros&municipality=Las%20Rozas%20de%20Madrid",
  "/admin/proveedores",
  "/admin/proveedores?period=90&category=actividades&municipality=Majadahonda",
  "/admin/usuarios",
  "/admin/usuarios?period=90",
  "/mi-ficha-profesional",
  "/solicitudes-profesionales"
];

for (const path of protectedPaths) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  const location = response.headers.get("location") || "";
  const ok = [302, 303, 307, 308].includes(response.status) && location.startsWith("/login");
  console.log(`${ok ? "OK" : "FAIL"} ${response.status} ${path} · acceso privado`);
  failed ||= !ok;
}

const invalidAnalyticsResponse = await fetch(`${baseUrl}/api/analytics/directory-event`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ events: [] })
});
const invalidAnalyticsBody = await invalidAnalyticsResponse.json().catch(() => null);
const invalidAnalyticsOk = invalidAnalyticsResponse.status === 200
  && invalidAnalyticsBody?.ok === true
  && invalidAnalyticsBody?.excluded === true
  && invalidAnalyticsBody?.reason === "consent_required";
console.log(`${invalidAnalyticsOk ? "OK" : "FAIL"} ${invalidAnalyticsResponse.status} /api/analytics/directory-event · rechazo sin escritura`);
failed ||= !invalidAnalyticsOk;

const invalidAuthResponse = await fetch(`${baseUrl}/auth/callback`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ token_hash: "invalid", type: "recovery", next: "/restablecer-contrasena" }),
  redirect: "manual"
});
const invalidAuthLocation = invalidAuthResponse.headers.get("location") || "";
const invalidAuthOk = invalidAuthResponse.status === 303 && invalidAuthLocation.endsWith("/restablecer-contrasena?error=invalid_link");
console.log(`${invalidAuthOk ? "OK" : "FAIL"} ${invalidAuthResponse.status} /auth/callback · token inválido rechazado`);
failed ||= !invalidAuthOk;

if (failed) process.exitCode = 1;
