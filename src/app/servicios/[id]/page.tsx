import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock3, Euro, ExternalLink, Mail, MessageCircle, Phone, Sparkles } from "lucide-react";
import AnalyticsViewEvent from "@/components/AnalyticsViewEvent";
import { TrustBadge } from "@/components/Badge";
import Breadcrumbs from "@/components/Breadcrumbs";
import ImageWithFallback from "@/components/ImageWithFallback";
import JsonLd from "@/components/JsonLd";
import ProfileAvatar from "@/components/ProfileAvatar";
import ProviderProfileSections from "@/components/ProviderProfileSections";
import { trackingAttrs } from "@/lib/analytics";
import { uniqueDisplayTags } from "@/lib/display-labels";
import { ageLabel, findProvider, listings, providers } from "@/lib/mock-data";
import type { Listing, Provider } from "@/lib/types";

const serviceFallbackImage = "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600";

function isPersonalProvider(provider: NonNullable<ReturnType<typeof findProvider>>) {
  const value = [provider.id, provider.category, provider.businessName, ...provider.tags].join(" ").toLowerCase();
  return value.includes("canguro") || value.includes("profesor") || value.includes("particular");
}

function isChildcareProvider(provider: NonNullable<ReturnType<typeof findProvider>>) {
  return provider.category.toLowerCase().includes("canguro");
}

function cleanValue(value?: string) {
  if (!value || value.toLowerCase().includes("pendiente")) return "No indicado";
  return value;
}

function weeklyAvailability(value?: string) {
  const fallback = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((day) => [day, "Consultar"] as const);
  if (!value) return fallback;
  const rows = value.split(";").map((item) => {
    const [day, status] = item.split(":");
    return [day?.trim() || "", status?.trim() || "Consultar"] as const;
  }).filter(([day]) => day);
  return rows.length ? rows : fallback;
}

function availabilityTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("no disponible")) return "border-line bg-panel text-muted";
  if (normalized.includes("consultar")) return "border-amber-300 bg-amber-50 text-slatecopy";
  return "border-ink/30 bg-ink/5 text-slatecopy";
}

function monthAvailability(value?: string) {
  const days = weeklyAvailability(value);
  return Array.from({ length: 4 }, (_, week) => ({
    label: `Semana ${week + 1}`,
    days
  }));
}

function providerCategoryLabel(provider: Provider) {
  return isChildcareProvider(provider) ? "Canguro" : provider.category;
}

export function generateStaticParams() {
  return providers.map((provider) => ({ id: provider.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const provider = findProvider(params.id);
  if (!provider) return { title: "Servicio no encontrado | Tenlo" };
  return { title: `${provider.businessName} | Servicios para familias | Tenlo`, description: provider.description };
}

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  const provider = findProvider(params.id);
  if (!provider) notFound();

  const personalProvider = isPersonalProvider(provider);
  const childcareProvider = isChildcareProvider(provider);
  const listing = listings.find((item) => item.userId === provider.userId && item.publicationType === "proveedor");
  const providerUrl = provider.website?.startsWith("http") ? provider.website : undefined;
  const providerEmail = provider.email.includes("@") ? provider.email : undefined;
  const categoryLabel = providerCategoryLabel(provider);
  const visibleTags = uniqueDisplayTags(provider.tags, [categoryLabel, provider.category, provider.municipality, provider.serviceArea, "Canguros", "Referencias"]).slice(0, 6);
  const relatedServices = providers
    .filter((item) => item.id !== provider.id && (item.municipality === provider.municipality || item.category === provider.category))
    .slice(0, 3);

  return (
    <div className="section-shell">
      <AnalyticsViewEvent event="provider_profile_viewed" params={{ provider_id: provider.id, category: provider.category, municipality: provider.municipality, trust_level: provider.trustLevel }} />
      <Breadcrumbs items={[{ label: "Servicios", href: "/servicios" }, { label: provider.businessName }]} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: provider.businessName,
        description: provider.description,
        areaServed: provider.serviceArea,
        telephone: cleanValue(provider.phone),
        email: providerEmail,
        url: providerUrl
      }} />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <article>
          <ImageWithFallback src={provider.image} fallbackSrc={serviceFallbackImage} alt={`Imagen de ${provider.businessName}`} className="h-64 w-full rounded-2xl border border-line object-cover sm:h-80" />
          <div className="mt-6 flex items-center gap-4">
            <ProfileAvatar name={provider.businessName} role="provider" image={provider.image} />
            <div className="flex min-w-0 items-start gap-3">
              <h1 className="page-title m-0">{provider.businessName}</h1>
            </div>
          </div>
          <p className="lead">{provider.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <TrustBadge level={provider.trustLevel} />
            <span className="chip">{categoryLabel}</span>
            {visibleTags.map((tag) => <span key={tag} className="chip">{tag}</span>)}
          </div>

          <section className="mt-8 grid gap-5">
            {childcareProvider && listing ? (
              <ChildcareProfile provider={provider} listing={listing} />
            ) : (
              <ProviderProfileSections provider={provider} listing={listing} />
            )}
            <Link href={`/sugerencias?context=servicio&item=${provider.id}`} className="inline-flex text-sm font-semibold text-ink underline">¿Hay algún dato incorrecto? Avísanos</Link>
          </section>

          {relatedServices.length > 0 ? (
            <section className="mt-6 card p-5">
              <h2 className="text-lg font-semibold text-ink">Servicios relacionados</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {relatedServices.map((item) => (
                  <Link key={item.id} href={`/servicios/${item.id}`} className="rounded-2xl border border-line bg-soft p-4 text-sm font-semibold text-slatecopy hover:text-ink">
                    {item.businessName}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </article>

        <aside className="card h-fit p-6">
          <h2 className="text-xl font-semibold text-ink">{childcareProvider ? "Solicitud protegida" : personalProvider ? "Contacto entre adultos" : "Contacto del servicio"}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {childcareProvider
              ? "Primero envía una solicitud protegida desde Tenlo. Si ambas partes encajan, podréis acordar el canal de confirmación sin publicar datos de menores."
              : personalProvider
              ? "En servicios entre particulares, acuerda siempre la comunicación como adulto responsable y evita compartir datos identificativos de menores."
              : "Consulta la web o los datos públicos del proveedor antes de reservar o contratar."}
          </p>
          {childcareProvider ? (
            <Link href={`/sugerencias?context=contact_request&item=${provider.id}`} className="btn-primary mt-5 w-full" {...trackingAttrs("contact_email", { item: provider.id, type: "provider" })}>
              <MessageCircle size={16} /> Solicitar contacto
            </Link>
          ) : providerUrl ? (
            <a href={providerUrl} target="_blank" rel="noreferrer" className="btn-primary mt-5 w-full" {...trackingAttrs("external_web", { item: provider.id, type: "provider" })}>
              Web oficial<ExternalLink size={16} />
            </a>
          ) : providerEmail ? (
            <a href={`mailto:${provider.email}`} className="btn-primary mt-5 w-full" {...trackingAttrs("contact_email", { item: provider.id, type: "provider" })}>
              <Mail size={16} /> Contactar
            </a>
          ) : cleanValue(provider.phone) !== "No indicado" ? (
            <a href={`tel:${provider.phone.replace(/\s/g, "")}`} className="btn-primary mt-5 w-full" {...trackingAttrs("contact_phone", { item: provider.id, type: "provider" })}>
              <Phone size={16} /> Llamar
            </a>
          ) : null}
          <Link href={`/validar-ficha?tipo=servicio&id=${provider.id}`} className="btn-secondary mt-3 w-full" {...trackingAttrs("claim_profile_click", { item: provider.id, type: "provider" })}>¿Es tu negocio?</Link>
        </aside>
      </div>
    </div>
  );
}

function ChildcareProfile({ provider, listing }: { provider: Provider; listing: Listing }) {
  const details = listing.details;
  const summary = [
    { label: "Tarifa", value: listing.priceLabel ?? details.Tarifa ?? "Consultar", Icon: Euro },
    { label: "Disponibilidad", value: listing.availability ?? details.Disponibilidad ?? "Consultar", Icon: CalendarDays },
    { label: "Preaviso", value: details.Preaviso ?? "Confirmar antes de reservar", Icon: Clock3 },
    { label: "Experiencia", value: details.Experiencia ?? "Consultar", Icon: Sparkles }
  ];

  return (
    <>
      <section className="card p-5 md:p-6">
        <h2 className="text-2xl font-semibold text-ink">Datos clave para reservar</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {summary.map(({ label, value, Icon }) => (
            <div key={label} className="rounded-2xl border border-line bg-soft p-4">
              <Icon size={20} className="text-ink" aria-hidden />
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.05em] text-muted">{label}</p>
              <p className="mt-1 text-base font-semibold leading-6 text-slatecopy">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5 md:p-6">
        <h2 className="text-2xl font-semibold text-ink">Calendario orientativo del mes</h2>
        <div className="mt-5 space-y-3">
          {monthAvailability(details["Disponibilidad semanal"]).map((week) => (
            <div key={week.label} className="grid gap-2 lg:grid-cols-[82px_1fr] lg:items-center">
              <p className="text-xs font-bold uppercase tracking-[0.05em] text-muted">{week.label}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {week.days.map(([day, status]) => (
                  <div key={`${week.label}-${day}`} className={`min-h-20 rounded-2xl border p-3 text-center ${availabilityTone(status)}`}>
                    <p className="text-sm font-bold text-ink">{day}</p>
                    <p className="mt-1 text-xs font-semibold leading-5">{status}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-muted">
          <span className="rounded-full border border-ink/30 bg-ink/5 px-3 py-1">Disponible</span>
          <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1">Consultar</span>
          <span className="rounded-full border border-line bg-panel px-3 py-1">Sin servicio</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">La disponibilidad es orientativa y debe confirmarse entre adultos antes de reservar.</p>
      </section>

      <InfoBlock title="Experiencia y confianza" items={[
        ["Experiencia", details.Experiencia ?? "Consultar"],
        ["Referencias y opiniones", "Se mostrarán como verificaciones del perfil"],
        ["Verificaciones", details.Verificaciones ?? "Pendiente de validación"],
        ["Contacto", cleanValue(provider.phone)]
      ]} />

      <InfoBlock title="Condiciones y preferencias" items={[
        ["Edades orientativas", details.Edades ?? ageLabel(listing)],
        ["Modalidad", details.Modalidad ?? "Consultar"],
        ["Apoyo incluido", details.Comodidades ?? "Consultar"],
        ["Idiomas", details.Idiomas ?? "Consultar"]
      ]} />
    </>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[][] }) {
  return (
    <section className="card p-6">
      <h2 className="text-2xl font-semibold text-ink">{title}</h2>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line bg-soft p-4">
            <dt className="label">{label}</dt>
            <dd className="mt-2 break-words text-sm font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
