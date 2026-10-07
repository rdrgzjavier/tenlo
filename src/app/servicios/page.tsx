import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, ExternalLink, Search } from "lucide-react";
import { categories, listings, municipalities, providers } from "@/lib/mock-data";
import { TrustBadge } from "@/components/Badge";
import ImageWithFallback from "@/components/ImageWithFallback";
import ValidatedSearchForm from "@/components/ValidatedSearchForm";
import JsonLd from "@/components/JsonLd";
import LoadMoreGrid from "@/components/LoadMoreGrid";
import { trackingAttrs } from "@/lib/analytics";
import { uniqueDisplayTags } from "@/lib/display-labels";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Servicios para familias en Las Rozas, Majadahonda, Pozuelo y Boadilla",
  description: "Directorio local de clases particulares, extraescolares, campamentos, canguros profesionales, uniformes, libros y recursos familiares en Madrid noroeste.",
  alternates: { canonical: "/servicios" },
  openGraph: {
    title: "Servicios para familias en Madrid noroeste | Tenlo",
    description: "Busca servicios familiares por zona, categoría, edad recomendada y nivel de verificación.",
    url: "/servicios"
  }
};

const serviceFallbacks = [
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80"
];

function providerFallback(id: string) {
  const index = Array.from(id).reduce((total, char) => total + char.charCodeAt(0), 0) % serviceFallbacks.length;
  return serviceFallbacks[index];
}

function isChildcareProvider(provider: (typeof providers)[number]) {
  return provider.category.toLowerCase().includes("canguro");
}

function providerCategoryLabel(provider: (typeof providers)[number]) {
  return isChildcareProvider(provider) ? "Canguro" : provider.category;
}

const situations = [
  { text: "Busco apoyo escolar cerca del cole", href: "/buscar?tag=clases-particulares" },
  { text: "Necesito campamento en días sin cole", href: "/buscar?tag=campamentos" },
  { text: "Quiero encontrar extraescolares en mi zona", href: "/buscar?tag=extraescolares" },
  { text: "Necesito una sala para un cumpleaños", href: "/buscar?tag=salas%20multiusos" },
  { text: "Busco un canguro cerca de casa", href: "/buscar?tag=canguros" }
];

export default function ServicesPage() {
  const serviceCategories = categories.filter(c => c.id !== "centros");

  return (
    <div className="section-shell">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Servicios para familias en Madrid noroeste",
        description: "Listado de servicios familiares revisados por Tenlo para Las Rozas, Majadahonda, Pozuelo y Boadilla.",
        itemListElement: providers.map((provider, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/servicios/${provider.id}`),
          name: provider.businessName
        }))
      }} />
      <p className="label">Profesionales y negocios locales</p>
      <h1 className="page-title">Servicios para familias</h1>
      <p className="lead">Profesores, academias, clubes, tiendas, librerías, canguros profesionales, campamentos, idiomas y apoyo especializado para familias.</p>
      <section className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-slatecopy">Situaciones que Tenlo ayuda a resolver</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {situations.map((situation) => (
            <Link key={situation.text} href={situation.href} className="chip hover:text-ink">{situation.text}</Link>
          ))}
        </div>
      </section>

      {/* Filters Section */}
      <ValidatedSearchForm className="filter-shell sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]" message="Completa al menos una palabra clave, zona, tipología o precio para filtrar.">
        <div className="filter-control">
          <Search size={18} className="text-muted" />
          <input name="tag" aria-label="Buscar servicios por palabra clave" placeholder="Palabra clave..." className="filter-input" />
        </div>
        <div className="relative">
          <select name="municipio" aria-label="Filtrar servicios por zona" className="filter-select">
            <option value="">Todas las zonas</option>
            {municipalities.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <ChevronDown size={18} className="text-muted" />
          </div>
        </div>
        <div className="relative">
          <select name="categoria" aria-label="Filtrar servicios por tipología" className="filter-select">
            <option value="">Todas las tipologías</option>
            {serviceCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <ChevronDown size={18} className="text-muted" />
          </div>
        </div>
        <div className="relative">
          <select name="precio" aria-label="Filtrar servicios por precio" className="filter-select">
            <option value="">Cualquier precio</option>
            <option value="gratis">Gratis</option>
            <option value="25">Hasta 25 €</option>
            <option value="75">25-75 €</option>
            <option value="mas-75">Más de 75 €</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <ChevronDown size={18} className="text-muted" />
          </div>
        </div>
        <button className="btn-primary px-8" type="submit">Filtrar</button>
      </ValidatedSearchForm>

      <div className="mt-12 flex flex-wrap items-end justify-between gap-4">
        <h2 className="section-title">Servicios disponibles</h2>
        <Link href="/login" className="btn-secondary">Publicar oferta</Link>
      </div>

      <LoadMoreGrid className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <article key={provider.id} className="card flex h-full flex-col overflow-hidden">
            <Link href={`/servicios/${provider.id}`} aria-label={`Saber más sobre ${provider.businessName}`} className="relative block">
              <ImageWithFallback src={provider.image} fallbackSrc={providerFallback(provider.id)} alt={`Imagen de ${provider.businessName}`} className="h-44 w-full object-cover" />
              <span className="absolute right-3 top-3"><TrustBadge level={provider.trustLevel} variant="solid" /></span>
            </Link>
            <div className="flex flex-1 flex-col p-5">
              {(() => {
                const categoryLabel = providerCategoryLabel(provider);
                const visibleTags = uniqueDisplayTags(provider.tags, [categoryLabel, provider.category, provider.municipality, provider.serviceArea, "Canguros", "Referencias"]).slice(0, 3);

                return (
                  <>
              <h3 className="card-title text-ink"><Link href={`/servicios/${provider.id}`}>{provider.businessName}</Link></h3>
              <p className="supporting-copy mt-2 line-clamp-3">{provider.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="chip">{categoryLabel}</span>
                {visibleTags.map((tag) => <span key={tag} className="chip">{tag}</span>)}
              </div>
                  </>
                );
              })()}
              <div className="mt-4 grid gap-2 pb-5 text-sm text-slatecopy">
                {providerCardFacts(provider).map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3"><span>{label}</span><span className="text-right font-medium text-ink">{value}</span></div>
                ))}
              </div>
              <div className="mt-auto flex gap-2 pt-5">
                <Link href={`/servicios/${provider.id}`} aria-label={`Saber más sobre ${provider.businessName}`} className="btn-primary flex-1 justify-center" {...trackingAttrs("result_opened", { item: provider.id, type: "provider" })}>Saber más</Link>
                {provider.website.startsWith("http") ? <a href={provider.website} target="_blank" rel="noreferrer" className="icon-button" aria-label="Web oficial" {...trackingAttrs("contact_web_clicked", { item: provider.id, type: "provider" })}><ExternalLink size={18} /></a> : null}
              </div>
            </div>
          </article>
        ))}
      </LoadMoreGrid>

      <section className="mt-20 rounded-3xl bg-lavender/30 p-8 md:p-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="label">Piloto para proveedores</p>
          <h2 className="section-title mt-2 text-center">Gestiona tu ficha sin coste durante el piloto</h2>
          <p className="mt-4 leading-7 text-slatecopy">Revisa tus datos, completa la información relevante de tu servicio y ayúdanos a medir qué visibilidad y solicitudes resultan realmente útiles antes de definir planes de pago.</p>
          <Link href="/proveedores" className="btn-primary mt-7">Conocer el programa fundador</Link>
        </div>
      </section>
    </div>
  );
}

function providerCardFacts(provider: (typeof providers)[number]) {
  const listing = listings.find((item) => item.userId === provider.userId && item.publicationType === "proveedor");
  if (isChildcareProvider(provider)) {
    return [
      ["Tarifa", listing?.priceLabel ?? "Consultar"],
      ["Disponibilidad", listing?.availability ?? "Consultar"],
      ["Preaviso", listing?.details.Preaviso ?? "Confirmar antes de reservar"]
    ];
  }

  return [
    ["Zona", provider.municipality],
    ["Cobertura", provider.serviceArea]
  ];
}
