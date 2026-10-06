import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactRequestForm from "@/components/ContactRequestForm";
import { findListing } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Solicitar información | Tenlo",
  description: "Envía una solicitud protegida a través de Tenlo."
};

export default function ContactRequestPage({ searchParams }: { searchParams: { item?: string } }) {
  const listing = searchParams.item ? findListing(searchParams.item) : undefined;
  if (!listing) notFound();

  return (
    <main className="section-shell max-w-4xl">
      <Breadcrumbs items={[{ label: "Ficha", href: `/anuncios/${listing.slug}` }, { label: "Solicitar información" }]} />
      <p className="label">Contacto protegido</p>
      <h1 className="page-title">Solicitar información</h1>
      <p className="lead max-w-3xl">Cuéntanos lo necesario para saber si esta opción puede ayudarte. Tenlo conservará la solicitud y podrás consultar su estado desde tu área personal.</p>
      <section className="card mt-8 p-5 md:p-8">
        <ContactRequestForm targetId={listing.id} title={listing.title} categoryId={listing.categoryId} municipality={listing.municipality} />
      </section>
    </main>
  );
}
