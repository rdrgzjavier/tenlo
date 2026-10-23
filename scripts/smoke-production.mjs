const baseUrl = (process.env.TENLO_BASE_URL || "https://tenlo.es").replace(/\/$/, "");

const publicChecks = [
  ["/", ["Encuentra, compara y contacta", "+21", "+37"]],
  ["/centros", ["Centros educativos"]],
  ["/centros/ceip-agora-boadilla", ["CEIP Ágora"]],
  ["/servicios", ["Servicios para familias"]],
  ["/servicios/centro-cultural-volturno-pozuelo", ["Centro Cultural Volturno"]],
  ["/buscar?municipio=Majadahonda", ["Majadahonda"]],
  ["/sitemap.xml", ["/centros/ceip-agora-boadilla", "/servicios/centro-cultural-volturno-pozuelo"]]
];

let failed = false;

for (const [path, expectedTexts] of publicChecks) {
  const response = await fetch(`${baseUrl}${path}`, { headers: { "User-Agent": "Tenlo production smoke check" } });
  const body = await response.text();
  const missing = expectedTexts.filter((text) => !body.includes(text));
  const ok = response.status === 200 && missing.length === 0;
  console.log(`${ok ? "OK" : "FAIL"} ${response.status} ${path}${missing.length ? ` · faltan: ${missing.join(", ")}` : ""}`);
  failed ||= !ok;
}

const protectedResponse = await fetch(`${baseUrl}/admin/rendimiento`, { redirect: "manual" });
const protectedOk = [302, 303, 307, 308].includes(protectedResponse.status) && (protectedResponse.headers.get("location") || "").startsWith("/login");
console.log(`${protectedOk ? "OK" : "FAIL"} ${protectedResponse.status} /admin/rendimiento · acceso privado`);
failed ||= !protectedOk;

const invalidAnalyticsResponse = await fetch(`${baseUrl}/api/analytics/directory-event`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ events: [] })
});
const invalidAnalyticsOk = invalidAnalyticsResponse.status === 400 || invalidAnalyticsResponse.status === 404;
console.log(`${invalidAnalyticsOk ? "OK" : "FAIL"} ${invalidAnalyticsResponse.status} /api/analytics/directory-event · rechazo sin escritura`);
failed ||= !invalidAnalyticsOk;

if (failed) process.exitCode = 1;
