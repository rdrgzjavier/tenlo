import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CenterCard from "@/components/CenterCard";
import ListingCard from "@/components/ListingCard";
import { centers, listings, municipalities } from "@/lib/mock-data";

export function generateStaticParams() {
  return municipalities.map((municipality) => ({ slug: municipality.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const municipality = municipalities.find((item) => item.slug === slug);
  return {
    title: `Servicios para familias en ${municipality?.name ?? "tu zona"} | Tenlo`,
    description: municipality?.description,
    alternates: { canonical: `/zonas/${slug}` },
    openGraph: {
      title: `Servicios para familias en ${municipality?.name ?? "Madrid noroeste"} | Tenlo`,
      description: municipality?.description,
      url: `/zonas/${slug}`
    }
  };
}

export default async function ZonePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const municipality = municipalities.find((item) => item.slug === slug);
  if (!municipality) notFound();
  const zoneListings = listings.filter((listing) => listing.municipality === municipality.name);
  const zoneCenters = centers.filter((center) => center.municipality === municipality.name);

  return (
    <div className="page py-10">
      <p className="label">Zona</p>
      <h1 className="page-title text-ink">Servicios para familias en {municipality.name}</h1>
      <p className="mt-3 max-w-3xl text-slatecopy">{municipality.description}</p>
      <section className="mt-8">
        <h2 className="section-title">Publicaciones</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zoneListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
      </section>
      <section className="mt-10">
        <h2 className="section-title">Centros</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {zoneCenters.map((center) => <CenterCard key={center.id} center={center} />)}
        </div>
      </section>
    </div>
  );
}
