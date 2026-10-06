import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock3, Euro, Flag, MessageCircle, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import FavoriteButton from "@/components/FavoriteButton";
import ImageWithFallback from "@/components/ImageWithFallback";
import LocationCard from "@/components/LocationCard";
import { trackingAttrs } from "@/lib/analytics";
import { uniqueDisplayTags } from "@/lib/display-labels";
import { ageLabel, categories, centers, findListing, listings, providers } from "@/lib/mock-data";
import type { Listing } from "@/lib/types";

export function generateStaticParams() {
  return listings.map((listing) => ({ id: listing.slug }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const listing = findListing(params.id);
  return {
    title: listing ? `${listing.title} | Tenlo` : "Recurso | Tenlo",
    description: listing?.description
  };
}

function fallbackImage(categoryId: string) {
  if (categoryId === "centros") return "https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg?auto=compress&cs=tinysrgb&w=1600";
  if (categoryId === "uniformes" || categoryId === "libros-material") return "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1600";
  if (categoryId === "campamentos" || categoryId === "extraescolares" || categoryId === "centros-deportivos") return "https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1600";
  return "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600";
}

function isChildcareListing(categoryId: string) {
  return categoryId === "canguros";
}

function categoryDisplayName(categoryId: string, categoryName?: string) {
  return isChildcareListing(categoryId) ? "Canguro" : categoryName;
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

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = findListing(params.id);
  if (!listing) notFound();
  const category = categories.find((item) => item.id === listing.categoryId);
  const center = centers.find((item) => item.id === listing.centerId);
  const provider = providers.find((item) => item.userId === listing.userId);
  const isVerified = listing.trustLevel === "verified" || listing.trustLevel === "official";
  const childcareListing = isChildcareListing(listing.categoryId);
  const categoryLabel = categoryDisplayName(listing.categoryId, category?.name);
  const visibleTags = uniqueDisplayTags(listing.tags, [categoryLabel, category?.name, listing.municipality, listing.area, "Canguros", "Referencias"]);

  return (
    <div className="page py-10">
      <Breadcrumbs items={[{ label: category?.name ?? "Recursos", href: category ? `/categoria/${category.slug}` : "/buscar" }, { label: listing.title }]} />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <article>
          <ImageWithFallback src={listing.image} fallbackSrc={fallbackImage(listing.categoryId)} alt={`Imagen de ${listing.title}`} className="mb-6 aspect-[16/7] w-full rounded-2xl border border-line object-cover" />
          <div className="flex items-start gap-3">
            {isVerified ? <ShieldCheck className="mt-1 shrink-0 text-emerald-700" size={28} aria-label="Ficha verificada" /> : null}
            <h1 className="text-4xl font-bold leading-tight text-ink">{listing.title}</h1>
          </div>
          <p className="mt-5 text-lg leading-8 text-slatecopy">{listing.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {categoryLabel ? <span className="chip">{categoryLabel}</span> : null}
            {visibleTags.map((tag) => <span key={tag} className="chip">{tag}</span>)}
          </div>

          <section className="mt-8 grid gap-5">
            <InfoBlock title="Ubicación y contexto" items={[
              ["Zona", `${listing.municipality} · ${listing.area}`],
              ["Centro relacionado", center?.name ?? "No indicado"],
              [childcareListing ? "Edades orientativas" : "Edad recomendada", ageLabel(listing)]
            ]} />
            <LocationCard
              name={center?.name ?? provider?.businessName ?? listing.title}
              municipality={listing.municipality}
              address={center?.address}
              privateLocation={childcareListing || Boolean(provider?.phone.includes("Contacto protegido"))}
              serviceArea={provider?.serviceArea ?? listing.area}
              itemId={listing.id}
              itemType="listing"
            />
            {!childcareListing ? <InfoBlock title="Condiciones" items={[
              ["Precio", listing.priceLabel ?? (listing.price ? `${listing.price} €` : "Consultar")],
              ["Disponibilidad", listing.availability ?? "Consultar"],
              ["Condición", listing.condition ?? "No aplica"]
            ]} /> : null}
            {childcareListing ? <ChildcareListingProfile listing={listing} /> : null}
            {!childcareListing && Object.keys(listing.details).length > 0 ? (
              <section className="card p-6">
                <h2 className="text-2xl font-semibold text-ink">Información específica</h2>
                <dl className="mt-4 grid gap-3">
                  {Object.entries(listing.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4 border-b border-line pb-3 text-sm">
                      <dt className="font-semibold capitalize text-slatecopy">{key.replace(/([A-Z])/g, " $1")}</dt>
                      <dd className="text-right text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
            <Link href={`/sugerencias?context=anuncio&item=${listing.slug}`} className="inline-flex text-sm font-semibold text-ink underline">¿Hay algún dato incorrecto? Avísanos</Link>
          </section>
        </article>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="text-xl font-semibold text-ink">{childcareListing ? "Solicitud protegida" : "Contacto protegido"}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">El contacto se inicia desde la plataforma. No compartas datos personales de menores, horarios personales ni información sensible.</p>
            <Link href={`/solicitar?item=${listing.slug}`} className="btn-primary mt-5 w-full" {...trackingAttrs("contact_started", { item: listing.id, category: listing.categoryId })}><MessageCircle size={16} /> {childcareListing ? "Solicitar contacto" : "Contactar"}</Link>
            <FavoriteButton className="btn-secondary mt-3 w-full" label="Guardar favorito" targetId={listing.id} showLabel />
            <Link href={`/sugerencias?context=report_listing&item=${listing.slug}`} className="btn-secondary mt-3 w-full"><Flag size={16} /> Reportar publicación</Link>
          </div>
          <div className="rounded-2xl border border-coral/30 bg-coral/5 p-5">
            <ShieldAlert className="text-coral" size={24} aria-hidden />
            <h3 className="mt-3 font-semibold text-ink">Aviso de seguridad</h3>
            <p className="mt-2 text-sm leading-6 text-slatecopy">Plataforma dirigida exclusivamente a adultos. No publiques fotos de menores, nombres completos, clase, horarios personales ni datos sensibles.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ChildcareListingProfile({ listing }: { listing: Listing }) {
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
        ["Idiomas", details.Idiomas ?? "Consultar"]
      ]} />

      <InfoBlock title="Condiciones y preferencias" items={[
        ["Edades orientativas", details.Edades ?? ageLabel(listing)],
        ["Modalidad", details.Modalidad ?? "Consultar"],
        ["Apoyo incluido", details.Comodidades ?? "Consultar"],
        ["Preaviso", details.Preaviso ?? "Confirmar"]
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
