import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");
const [service, center, listing, requestPage, familyRequestsPage, connectionRoute, feedbackRoute, feedbackForm, analyticsRoute, performanceReport] = await Promise.all([
  read("src/app/servicios/[id]/page.tsx"),
  read("src/app/centros/[slug]/page.tsx"),
  read("src/app/anuncios/[id]/page.tsx"),
  read("src/app/solicitar/page.tsx"),
  read("src/app/solicitudes/page.tsx"),
  read("src/app/api/connection-request/route.ts"),
  read("src/app/api/connection-feedback/route.ts"),
  read("src/components/RequestOutcomeFeedback.tsx"),
  read("src/app/api/analytics/directory-event/route.ts"),
  read("src/app/admin/rendimiento/page.tsx")
]);

for (const [name, source] of [["servicio", service], ["centro", center], ["anuncio", listing]]) {
  assert(
    source.includes('trackingAttrs("contact_phone_clicked"') || !source.includes("tel:"),
    `Cada teléfono visible de ${name} debe emitir contact_phone_clicked.`
  );
}
assert(service.includes('trackingAttrs("contact_email_clicked"') && center.includes('trackingAttrs("contact_email_clicked"'), "Los emails directos deben estar medidos.");
assert(service.includes('trackingAttrs("contact_web_clicked"') && center.includes('trackingAttrs("contact_web_clicked"'), "Las salidas a webs oficiales deben estar medidas.");
assert(requestPage.includes("<ContactRequestForm") && connectionRoute.includes('.from("connection_requests").insert'), "Tenlo debe ofrecer una solicitud protegida y persistente además del contacto externo.");
assert(connectionRoute.includes("supabase.auth.getUser()") && connectionRoute.includes("adult_confirmation: true"), "La solicitud protegida debe exigir cuenta y confirmación adulta.");

for (const event of ["contact_phone_clicked", "contact_email_clicked", "contact_web_clicked"]) {
  assert(analyticsRoute.includes(`"${event}"`), `${event} debe estar permitido en la medición propia.`);
  assert(performanceReport.includes(`"${event}"`), `${event} debe alimentar el informe de rendimiento.`);
}
assert(analyticsRoute.includes('"request_created"'), "request_created debe estar permitido en la medición propia.");
assert(performanceReport.includes('.from("connection_requests")'), "El informe debe usar las solicitudes persistidas como fuente operativa de contactos protegidos.");
assert(
  familyRequestsPage.includes('["responded", "declined", "alternative_offered", "closed"].includes(request.status)') && familyRequestsPage.includes("<RequestOutcomeFeedback"),
  "La valoración debe pedirse solo cuando existe respuesta, rechazo, alternativa o cierre."
);
assert(
  feedbackRoute.includes('.eq("family_id", authData.user.id)') && feedbackRoute.includes('.from("connection_feedback").upsert'),
  "Solo la familia propietaria debe poder guardar o modificar el resultado de su solicitud."
);
assert(
  feedbackForm.includes('"information"') && feedbackForm.includes('"conversation"') && feedbackForm.includes('"proposal"') && feedbackForm.includes('"booking"') && feedbackForm.includes('"hired"') && feedbackForm.includes('"not_progressed"'),
  "La valoración debe distinguir información, conversación, propuesta, reserva, contratación y no avance."
);

console.log("OK Contacto directo medido y solicitud protegida persistente disponibles como vías complementarias.");
console.log("OK La valoración se solicita tras una actualización útil y solo puede guardarla la familia propietaria.");
