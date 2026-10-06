import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import FavoriteButton from "@/components/FavoriteButton";
import { trackingAttrs } from "@/lib/analytics";
import { uniqueDisplayTags } from "@/lib/display-labels";
import { ageLabel, categories, centers, providers } from "@/lib/mock-data";
import type { Listing } from "@/lib/types";
import { StatusBadge, TrustBadge } from "./Badge";

const imageBank: Record<string, string[]> = {
  centros: [
    "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80"
  ],
  extraescolares: [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80"
  ],
  "clases-particulares": [
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80"
  ],
  "libros-material": [
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=1200&q=80"
  ],
  uniformes: [
    "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1523381235211-75d0030f14f7?auto=format&fit=crop&w=1200&q=80"
  ],
  canguros: [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
  ]
};

function stableIndex(value: string, length: number) {
  return Array.from(value).reduce((total, char) => total + char.charCodeAt(0), 0) % length;
}

function fallbackImage(categoryId: string, slug: string) {
  const bank = imageBank[categoryId];
  if (bank?.length) return bank[stableIndex(slug, bank.length)];
  return "/images/cards/servicio-familiar.svg";
}

function centerTypeLabel(type?: string) {
  if (type === "publico") return "Centro público";
  if (type === "concertado") return "Centro concertado";
  if (type === "privado") return "Centro privado";
  return "Centro educativo";
}

function isChildcareListing(listing: Listing) {
  return listing.categoryId === "canguros";
}

function categoryDisplayName(listing: Listing, categoryName?: string) {
  return isChildcareListing(listing) ? "Canguro" : categoryName;
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const category = categories.find((item) => item.id === listing.categoryId);
  const center = centers.find((item) => item.id === listing.centerId);
  const provider = providers.find((item) => item.userId === listing.userId);
  const primaryCategory = categoryDisplayName(listing, category?.name);
  const typeLabel = center ? centerTypeLabel(center.type) : isChildcareListing(listing) ? "Perfil de canguro" : provider?.category ?? category?.name ?? "Recurso local";
  const detailLabel = center ? center.stages.slice(0, 3).join(", ") : listing.availability ?? listing.area;
  const detailHref = `/anuncios/${listing.slug}`;
  const hiddenTags = [
    primaryCategory,
    category?.name,
    category?.id,
    listing.municipality,
    listing.municipality.replace(" de Madrid", ""),
    "Familias",
    "Canguros",
    "Referencias",
    "Madrid noroeste",
    "cumpleaños"
  ];
  const visibleTags = uniqueDisplayTags(listing.tags, hiddenTags).slice(0, 4);

  return (
    <article className="card flex flex-col overflow-hidden">
      <Link href={detailHref} aria-label={`Saber más sobre ${listing.title}`} className="relative block">
        <ImageWithFallback src={listing.image} fallbackSrc={fallbackImage(listing.categoryId, listing.slug)} alt={`Imagen de ${listing.title}`} className="h-44 w-full object-cover" />
        <span className="absolute right-3 top-3"><TrustBadge level={listing.trustLevel} variant="solid" /></span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-7 text-ink"><Link href={detailHref}>{listing.title}</Link></h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{listing.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {primaryCategory ? <span className="chip">{primaryCategory}</span> : null}
          {listing.status !== "published" ? <StatusBadge status={listing.status} /> : null}
          {visibleTags.map((tag) => <span key={tag} className="chip">{tag}</span>)}
        </div>
        <div className="mt-4 rounded-xl bg-soft px-3 py-3 text-sm">
          <p className="font-semibold text-ink">{typeLabel}</p>
          <p className="mt-1 line-clamp-2 text-muted">{detailLabel}</p>
          <p className="mt-2 flex items-center gap-1.5 text-slatecopy"><MapPin size={15} className="text-ink" aria-hidden />{listing.municipality}</p>
        </div>
        <dl className="mt-4 grid gap-2 text-sm text-slatecopy">
          <div className="flex justify-between gap-3"><dt>{isChildcareListing(listing) ? "Edades" : "Edad"}</dt><dd className="font-medium text-ink">{ageLabel(listing)}</dd></div>
          <div className="flex justify-between gap-3"><dt>Precio</dt><dd className="font-medium text-ink">{listing.priceLabel ?? (listing.price ? `${listing.price} €` : "Consultar")}</dd></div>
        </dl>
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <Link href={detailHref} aria-label={`Saber más sobre ${listing.title}`} className="btn-primary flex-1 text-center" {...trackingAttrs("view_detail", { item: listing.id, category: listing.categoryId, municipality: listing.municipality })}>Saber más</Link>
          <Link href={`/sugerencias?context=contact_request&item=${listing.slug}`} className="icon-button" aria-label={isChildcareListing(listing) ? "Solicitar contacto" : "Contactar"} {...trackingAttrs("contact_email", { item: listing.id, category: listing.categoryId })}><MessageCircle size={18} /></Link>
          <FavoriteButton label={`Guardar ${listing.title}`} />
        </div>
      </div>
    </article>
  );
}
