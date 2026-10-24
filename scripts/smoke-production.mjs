const baseUrl = (process.env.TENLO_BASE_URL || "https://tenlo.es").replace(/\/$/, "");

const publicChecks = [
  ["/", ["Encuentra, compara y contacta", "+21", "+37"]],
  ["/centros", ["Centros educativos"]],
  ["/centros/ceip-agora-boadilla", ["CEIP Ágora"]],
  ["/servicios", ["Servicios para familias"]],
  ["/servicios/centro-cultural-volturno-pozuelo", ["Centro Cultural Volturno"]],
  ["/buscar?municipio=Majadahonda", ["Majadahonda"]],
  ["/sitemap.xml", ["/centros/ceip-agora-boadilla", "/servicios/centro-cultural-volturno-pozuelo"]],
  ["/robots.txt", ["Sitemap: https://tenlo.es/sitemap.xml", "Disallow: /admin/"]],
  ["/llms.txt", ["# Tenlo", "[Buscar en Tenlo](https://tenlo.es/buscar)", "## Límites de uso"]]
];

let failed = false;

for (const [path, expectedTexts] of publicChecks) {
  const response = await fetch(`${baseUrl}${path}`, { headers: { "User-Agent": "Tenlo production smoke check" } });
  const body = await response.text();
  const missing = expectedTexts.filter((text) => !body.includes(text));
  const contentTypeOk = path !== "/llms.txt" || response.headers.get("content-type")?.includes("text/markdown");
  const ok = response.status === 200 && missing.length === 0 && contentTypeOk;
  console.log(`${ok ? "OK" : "FAIL"} ${response.status} ${path}${missing.length ? ` · faltan: ${missing.join(", ")}` : ""}${contentTypeOk ? "" : " · Content-Type no es text/markdown"}`);
  failed ||= !ok;
}

const protectedPaths = [
  "/admin",
  "/admin/demanda?period=30",
  "/admin/demanda?period=90&category=extraescolares&municipality=Majadahonda",
  "/admin/rendimiento",
  "/admin/rendimiento?period=180",
  "/admin/rendimiento?period=90&category=centros&municipality=Las%20Rozas%20de%20Madrid",
  "/admin/usuarios",
  "/admin/usuarios?period=90",
  "/mi-ficha-profesional"
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
const invalidAnalyticsOk = invalidAnalyticsResponse.status === 400 || invalidAnalyticsResponse.status === 404;
console.log(`${invalidAnalyticsOk ? "OK" : "FAIL"} ${invalidAnalyticsResponse.status} /api/analytics/directory-event · rechazo sin escritura`);
failed ||= !invalidAnalyticsOk;

if (failed) process.exitCode = 1;
