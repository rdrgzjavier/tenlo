import type { Metadata } from "next";
import Link from "next/link";
import AnalyticsViewEvent from "@/components/AnalyticsViewEvent";
import Filters from "@/components/Filters";
import ListingCard from "@/components/ListingCard";
import LoadMoreGrid from "@/components/LoadMoreGrid";
import ResponsiveFilterPanel from "@/components/ResponsiveFilterPanel";
import { listings, municipalities } from "@/lib/mock-data";
import { trackingAttrs } from "@/lib/analytics";

type SearchParams = Record<string, string | string[] | undefined>;

function value(params: SearchParams, key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

const keywordAliases: Record<string, string[]> = {
  profesor: ["profesor", "profesora", "clase", "clases", "apoyo", "academia"],
  profesores: ["profesor", "profesora", "clase", "clases", "apoyo", "academia"],
  matematicas: ["matematicas", "matemáticas", "mates"],
  mates: ["matematicas", "matemáticas", "mates"],
  canguro: ["canguro", "canguros", "babysitter", "cuidador"],
  cumpleanos: ["cumpleanos", "cumpleaños", "fiestas", "eventos", "sala"],
  tecnologia: ["tecnologia", "tecnología", "robotica", "robótica", "programacion", "programación"]
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function queryTokenGroups(query: string) {
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => (keywordAliases[token] ?? [token]).map(normalize));
}

export function generateMetadata({ searchParams }: { searchParams: SearchParams }): Metadata {
  const cat = value(searchParams, "categoria");
  const mun = value(searchParams, "municipio");
  const tag = value(searchParams, "tag");

  let title = "Buscar recursos para familias en Madrid noroeste | Tenlo";
  if (cat && mun) title = `${cat} en ${mun} | Tenlo`;
  else if (cat) title = `${cat} para familias | Tenlo`;
  else if (mun) title = `Recursos para familias en ${mun} | Tenlo`;
  else if (tag) title = `${tag} cerca del colegio | Tenlo`;

  return {
    title,
    description: "Filtra recursos por categoría, municipio, centro educativo, edad recomendada, precio y verificación.",
    alternates: { canonical: "/buscar" },
    openGraph: {
      title,
      description: "Resultados de búsqueda de Tenlo para servicios, centros y recursos familiares en Madrid noroeste.",
      url: "/buscar"
    }
  };
}

export default function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const selected = {
    categoria: value(searchParams, "categoria"),
    municipio: value(searchParams, "municipio"),
    centro: value(searchParams, "centro"),
    edad: value(searchParams, "edad"),
    precio: value(searchParams, "precio"),
    tipo: value(searchParams, "tipo"),
    verificado: value(searchParams, "verificado"),
    disponibilidad: value(searchParams, "disponibilidad"),
    tag: value(searchParams, "tag"),
    region: value(searchParams, "region")
  };

  const [ageMin, ageMax] = selected.edad?.split("-").map(Number) ?? [];
  const filtered = listings.filter((listing) => {
    if (selected.categoria && listing.categoryId !== selected.categoria) return false;
    if (selected.municipio && listing.municipality !== selected.municipio) return false;
    if (selected.centro && listing.centerId !== selected.centro) return false;
    if (selected.tipo && listing.publicationType !== selected.tipo) return false;
    if (selected.verificado === "1" && !listing.verified) return false;
    if (selected.tag) {
      const needleGroups = queryTokenGroups(selected.tag);
      const haystack = normalize([listing.title, listing.description, listing.categoryId, listing.municipality, listing.area, ...listing.tags].join(" "));
      if (!needleGroups.every((group) => group.some((needle) => haystack.includes(needle)))) return false;
    }
    if (selected.edad && typeof ageMin === "number" && typeof ageMax === "number") {
      const listingMin = listing.recommendedAgeMin ?? 0;
      const listingMax = listing.recommendedAgeMax ?? 18;
      if (listingMax < ageMin || listingMin > ageMax) return false;
    }
    if (selected.precio === "gratis" && (listing.price ?? 0) !== 0 && !listing.priceLabel?.toLowerCase().includes("gratis")) return false;
    if (selected.precio === "25" && listing.price && listing.price > 25) return false;
    return true;
  });

  return (
    <div className="section-shell">
      <AnalyticsViewEvent event="search_results_viewed" params={{
        category: selected.categoria,
        municipality: selected.municipio,
        center_id: selected.centro,
        has_keyword: Boolean(selected.tag),
        result_count: filtered.length,
        zero_results: filtered.length === 0
      }} />
      <p className="label">Marketplace local moderado</p>
      <h1 className="page-title">{selected.region === "madrid" ? "Oferta para familias en Madrid" : "Buscar recursos"}</h1>
      <p className="lead">Encuentra publicaciones y servicios alrededor del centro, filtrados por zona y necesidades familiares no identificativas.</p>
      {selected.region === "madrid" ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {municipalities.map((municipality) => (
            <Link key={municipality.id} href={`/buscar?municipio=${encodeURIComponent(municipality.name)}`} className="btn-secondary">
              {municipality.name}
            </Link>
          ))}
        </div>
      ) : null}
      <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
        <ResponsiveFilterPanel>
          <Filters selected={selected} />
        </ResponsiveFilterPanel>
        <section aria-label="Resultados de búsqueda">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slatecopy">{filtered.length} resultado{filtered.length === 1 ? "" : "s"}</p>
          </div>
          {filtered.length > 0 ? (
            <LoadMoreGrid className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </LoadMoreGrid>
          ) : (
            <div className="card p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-ink">Todavía no tenemos una opción que encaje</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Prueba a quitar algún filtro o cuéntanos qué necesitas. Las búsquedas sin resultados nos ayudan a decidir qué proveedores debemos incorporar.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/buscar" className="btn-primary">Limpiar filtros</Link>
                <Link href="/contacto" className="btn-secondary" {...trackingAttrs("zero_results", { category: selected.categoria, municipality: selected.municipio })}>Pedir ayuda a Tenlo</Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
