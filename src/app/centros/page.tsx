// Force update: 2026-05-08T12:48
import type { Metadata } from "next";
import { ChevronDown, Search } from "lucide-react";
import CenterCard from "@/components/CenterCard";
import ValidatedSearchForm from "@/components/ValidatedSearchForm";
import JsonLd from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";
import { centers, municipalities } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Centros educativos en Madrid noroeste para familias",
  description: "Fichas informativas de colegios y centros educativos en Las Rozas, Majadahonda, Pozuelo y Boadilla, sin rankings agresivos ni datos de menores.",
  alternates: { canonical: "/centros" },
  openGraph: {
    title: "Centros educativos en Madrid noroeste | Tenlo",
    description: "Información pública y recursos relacionados para comparar centros educativos con contexto local.",
    url: "/centros"
  }
};

export default function CentersPage() {
  return (
    <div className="section-shell">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Centros educativos en Madrid noroeste",
        description: "Listado informativo de centros educativos con datos públicos, sin rankings agresivos.",
        itemListElement: centers.map((center, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/centros/${center.slug}`),
          name: center.name
        }))
      }} />
      <p className="label">Centros educativos</p>
      <h1 className="page-title">Fichas para familias</h1>
      <p className="lead">Información pública y criterios estructurados, sin rankings agresivos ni comentarios personales sobre profesores concretos.</p>
      <div className="mt-5 rounded-2xl border border-line bg-soft p-4 text-sm font-semibold leading-6 text-slatecopy">
        Las valoraciones están moderadas y buscan ayudar a las familias con información útil y respetuosa.
      </div>
      {/* Filters Section */}
      <ValidatedSearchForm
        className="filter-shell sm:grid-cols-[1fr_1fr_1fr_auto]"
        message="Completa al menos nombre, zona o tipología para filtrar centros."
        trackingEvent="filter_applied"
        trackingPlacement="centers_filters"
      >
        <div className="filter-control">
          <Search size={18} className="text-muted" />
          <input name="tag" aria-label="Buscar centros por nombre o zona" placeholder="Busca por nombre o zona..." className="filter-input" />
        </div>
        <div className="relative">
          <select name="municipio" aria-label="Filtrar centros por zona" className="filter-select">
            <option value="">Todas las zonas</option>
            {municipalities.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <ChevronDown size={18} className="text-muted" />
          </div>
        </div>
        <div className="relative">
          <select name="tipo" aria-label="Filtrar centros por tipología" className="filter-select">
            <option value="">Tipología de centro</option>
            <option value="publico">Público</option>
            <option value="concertado">Concertado</option>
            <option value="privado">Privado</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <ChevronDown size={18} className="text-muted" />
          </div>
        </div>
        <button className="btn-primary px-8" type="submit">Filtrar</button>
      </ValidatedSearchForm>

      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {centers.map((center) => <CenterCard key={center.id} center={center} />)}
      </div>
    </div>
  );
}
