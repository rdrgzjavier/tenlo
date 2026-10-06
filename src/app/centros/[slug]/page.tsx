import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Mail, Phone } from "lucide-react";
import AnalyticsViewEvent from "@/components/AnalyticsViewEvent";
import { TrustBadge } from "@/components/Badge";
import Breadcrumbs from "@/components/Breadcrumbs";
import ImageWithFallback from "@/components/ImageWithFallback";
import JsonLd from "@/components/JsonLd";
import LocationCard from "@/components/LocationCard";
import { trackingAttrs } from "@/lib/analytics";
import { centerTypeLabel, religiousCharacterLabel, uniqueDisplayTags } from "@/lib/display-labels";
import { centers, findCenter } from "@/lib/mock-data";

const centerFallbackImage = "https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg?auto=compress&cs=tinysrgb&w=1600";

export function generateStaticParams() {
  return centers.map((center) => ({ slug: center.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const center = findCenter(params.slug);
  if (!center) return { title: "Centro educativo | Tenlo" };
  return {
    title: `${center.name} en ${center.municipality} | Tenlo`,
    description: `${center.name}: ${centerTypeLabel(center.type)}, etapas ${center.stages.join(", ")}, servicios ${center.services.slice(0, 3).join(", ")}. Ficha pública para familias.`
  };
}

export default function CenterDetailPage({ params }: { params: { slug: string } }) {
  const center = findCenter(params.slug);
  if (!center) notFound();

  const centerUrl = center.website?.startsWith("http") ? center.website : undefined;
  const centerEmail = center.email.includes("@") ? center.email : undefined;
  const quickLinks = ["Uniformes", "Puertas abiertas", "Becas", "Extraescolares", "Admisiones"];
  const typeLabel = centerTypeLabel(center.type);
  const religiousLabel = religiousCharacterLabel(center.religiousCharacter);
  const visibleTags = uniqueDisplayTags(center.tags, [typeLabel, religiousLabel]);

  return (
    <div className="page py-10">
      <AnalyticsViewEvent event="center_profile_viewed" params={{ center_id: center.id, municipality: center.municipality, trust_level: center.trustLevel }} />
      <Breadcrumbs items={[{ label: "Centros", href: "/centros" }, { label: center.name }]} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: center.name,
        description: center.description,
        address: cleanValue(center.address),
        areaServed: center.municipality,
        telephone: cleanValue(center.phone),
        email: centerEmail,
        url: centerUrl
      }} />

      <ImageWithFallback src={center.image} fallbackSrc={centerFallbackImage} alt={`Imagen de ${center.name}`} className="mb-6 aspect-[16/7] w-full rounded-2xl border border-line object-cover" />

      <div className="mt-4 flex items-start gap-3">
        <h1 className="detail-title text-ink">{center.name}</h1>
      </div>
      <p className="mt-3 max-w-3xl text-lg leading-8 text-slatecopy">{center.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <TrustBadge level={center.trustLevel} />
        <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-slatecopy">{typeLabel}</span>
        {religiousLabel ? <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-slatecopy">{religiousLabel}</span> : null}
        {visibleTags.map((tag) => <span key={tag} className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-slatecopy">{tag}</span>)}
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {quickLinks.map((item) => (
          <Link key={item} href={`/buscar?centro=${center.id}`} className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-ink bg-ink/5 px-4 py-3 text-center text-sm font-bold text-ink shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink hover:text-white hover:shadow-lift focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 active:translate-y-0">
            {item}
          </Link>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-5">
          <LocationCard name={center.name} municipality={center.municipality} address={center.address} itemId={center.id} itemType="center" />
          <InfoBlock title="Contacto" items={[
            ["Web oficial", centerUrl ? center.website : "No indicado"],
            ["Email", centerEmail ? center.email : "No indicado"],
            ["Teléfono", cleanValue(center.phone)]
          ]} />
          <InfoBlock title="Oferta educativa" items={[
            ["Etapas", center.stages.join(", ")],
            ["Idiomas", center.languages.join(", ")],
            ["Servicios", center.services.join(", ")]
          ]} />
          <Link href={`/sugerencias?context=centro&item=${center.slug}`} className="inline-flex text-sm font-semibold text-ink underline">¿Hay algún dato incorrecto? Avísanos</Link>
        </section>

        <aside className="card h-fit p-6">
          <h2 className="subsection-title text-ink">Contactar con el centro</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Utiliza los datos públicos del centro y evita compartir información sensible de menores.</p>
          {cleanValue(center.phone) !== "No indicado" ? (
            <a href={`tel:${center.phone.replace(/\s/g, "")}`} className="btn-primary mt-5 w-full" {...trackingAttrs("contact_phone", { item: center.id, type: "center" })}><Phone size={16} /> Llamar</a>
          ) : null}
          {centerUrl ? (
            <a href={centerUrl} target="_blank" rel="noreferrer" className="btn-secondary mt-3 w-full" {...trackingAttrs("external_web", { item: center.id, type: "center" })}><ExternalLink size={16} /> Web oficial</a>
          ) : null}
          {centerEmail ? (
            <a href={`mailto:${centerEmail}`} className="btn-secondary mt-3 w-full" {...trackingAttrs("contact_email", { item: center.id, type: "center" })}><Mail size={16} /> Email</a>
          ) : null}
          <div className="my-5 border-t border-line" />
          <h2 className="subsection-title text-ink">¿Representas este centro?</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Si representas este centro, puedes corregir datos, aportar una imagen oficial o solicitar que el equipo de Tenlo valide la ficha.</p>
          <Link href={`/validar-ficha?tipo=centro&id=${center.slug}`} className="btn-primary mt-5 w-full" {...trackingAttrs("claim_profile_click", { item: center.id, type: "center" })}>Gestionar esta ficha</Link>
        </aside>
      </div>
    </div>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[][] }) {
  return (
    <section className="card p-6">
      <h2 className="subsection-title text-ink">{title}</h2>
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

function cleanValue(value?: string) {
  if (!value || value.toLowerCase().includes("pendiente")) return "No indicado";
  return value;
}
