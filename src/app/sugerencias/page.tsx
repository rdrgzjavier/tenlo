import type { Metadata } from "next";
import FeedbackForm from "@/components/FeedbackForm";
import ProviderSuggestionForm from "@/components/ProviderSuggestionForm";

export const metadata: Metadata = {
  title: "Sugerencias y mejoras | Tenlo",
  description: "Propón mejoras, recursos locales, centros o servicios que echas en falta en Tenlo."
};

export default async function SuggestionsPage({ searchParams }: { searchParams: Promise<{ context?: string; item?: string; location?: string; service?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const isProviderSuggestion = resolvedSearchParams.context === "provider_suggestion";
  const isContactRequest = resolvedSearchParams.context === "contact_request";
  const isReport = resolvedSearchParams.context === "report_listing";
  const title = isProviderSuggestion
    ? "Propón un proveedor o actividad"
    : isContactRequest
      ? "Contacta a través de Tenlo"
      : isReport
        ? "Reportar publicación"
        : "¿Echas en falta algo?";

  return (
    <main className="section-shell max-w-4xl">
      <p className="label">Ayúdanos a mejorar Tenlo</p>
      <h1 className="page-title">{title}</h1>
      <p className="lead max-w-3xl">
        {isProviderSuggestion
          ? "Ayúdanos a localizar opciones útiles para las familias. Revisaremos la información pública antes de crear una ficha No verificada."
          : isContactRequest
            ? "Envía tu solicitud y la gestionaremos sin exponer información sensible de menores."
            : isReport
              ? "Cuéntanos qué problema has detectado. Revisaremos la publicación y tomaremos las medidas necesarias."
              : "Tenlo está creciendo con información local útil para familias. Si detectas un dato incorrecto, conoces un servicio que debería aparecer o tienes una idea para mejorar la experiencia, cuéntanoslo."}
      </p>

      <section className="card mt-8 p-5 md:p-6">
        <h2 className="text-xl font-semibold text-ink">Qué nos ayuda</h2>
        <ul className="mt-4 grid gap-3 text-sm leading-6 text-muted sm:grid-cols-2">
          <li className="rounded-2xl bg-soft p-4">Centros, servicios o actividades que faltan en Las Rozas, Majadahonda, Pozuelo o Boadilla.</li>
          <li className="rounded-2xl bg-soft p-4">Datos públicos que deberíamos corregir en una ficha.</li>
          <li className="rounded-2xl bg-soft p-4">Necesidades reales de familias que Tenlo todavía no resuelve bien.</li>
          <li className="rounded-2xl bg-soft p-4">Ideas para hacer más clara la búsqueda o la comparación.</li>
        </ul>
      </section>

      <section className="card mt-6 p-5 md:p-8">
        <h2 className="text-2xl font-semibold text-ink">{isProviderSuggestion ? "Datos para revisar" : isContactRequest ? "Datos de la solicitud" : isReport ? "Datos del reporte" : "Enviar sugerencia"}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Revisamos las propuestas antes de incorporarlas. No incluyas datos identificativos de menores, fotos personales ni información sensible.
        </p>
        <div className="mt-6">
          {isProviderSuggestion ? (
            <ProviderSuggestionForm initialLocation={resolvedSearchParams.location} initialService={resolvedSearchParams.service ?? resolvedSearchParams.item} />
          ) : (
            <FeedbackForm context={resolvedSearchParams.context} itemId={resolvedSearchParams.item} />
          )}
        </div>
      </section>
    </main>
  );
}
