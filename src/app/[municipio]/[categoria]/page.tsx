import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ListingCard from "@/components/ListingCard";
import JsonLd from "@/components/JsonLd";
import { categories, listings, municipalities } from "@/lib/mock-data";

type Params = { municipio: string; categoria: string };

export function generateStaticParams() {
  return municipalities.flatMap((municipality) => categories.map((category) => ({
    municipio: municipality.slug,
    categoria: category.slug
  })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const municipality = municipalities.find((item) => item.slug === resolvedParams.municipio);
  const category = categories.find((item) => item.slug === resolvedParams.categoria);
  if (!municipality || !category) return { title: "Tenlo" };

  return {
    title: `${category.name} en ${municipality.name} | Tenlo`,
    description: `${category.seoDescription} Resultados locales para familias en ${municipality.name}.`,
    alternates: { canonical: `/${municipality.slug}/${category.slug}` },
    openGraph: {
      title: `${category.name} en ${municipality.name} | Tenlo`,
      description: category.seoDescription
    }
  };
}

export default async function LocalCategoryPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const municipality = municipalities.find((item) => item.slug === resolvedParams.municipio);
  const category = categories.find((item) => item.slug === resolvedParams.categoria);
  if (!municipality || !category) notFound();

  const results = listings.filter((listing) => listing.municipality === municipality.name && listing.categoryId === category.id);

  return (
    <div className="section-shell">
      <Breadcrumbs items={[
        { label: municipality.name, href: `/buscar?municipio=${encodeURIComponent(municipality.name)}` },
        { label: category.name }
      ]} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${category.name} en ${municipality.name}`,
        description: category.seoDescription,
        about: category.name,
        areaServed: municipality.name
      }} />
      <p className="label">Guía local Tenlo</p>
      <h1 className="page-title">{category.name} en {municipality.name}</h1>
      <p className="lead">{municipality.description} {category.description}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {results.length > 0 ? results.map((listing) => <ListingCard key={listing.id} listing={listing} />) : (
          <p className="card p-6 text-sm leading-6 text-muted">Estamos revisando recursos de esta categoría en {municipality.name}. Puedes explorar resultados cercanos o proponer una ficha.</p>
        )}
      </div>
    </div>
  );
}
