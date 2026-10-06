import { MapPinned, Navigation } from "lucide-react";
import { trackingAttrs } from "@/lib/analytics";

type LocationCardProps = {
  name: string;
  municipality: string;
  address?: string;
  privateLocation?: boolean;
  serviceArea?: string;
  itemId: string;
  itemType: "center" | "provider" | "listing";
};

function isUsefulAddress(address?: string) {
  if (!address) return false;
  const normalized = address.trim().toLowerCase();
  return normalized.length > 0 && !normalized.includes("consultar") && !normalized.includes("pendiente") && !normalized.includes("no indicado");
}

export default function LocationCard({ name, municipality, address, privateLocation = false, serviceArea, itemId, itemType }: LocationCardProps) {
  if (privateLocation) {
    return (
      <section className="card p-5 md:p-6">
        <div className="flex items-start gap-3">
          <MapPinned className="mt-0.5 shrink-0 text-ink" size={22} aria-hidden />
          <div>
            <h2 className="text-xl font-semibold text-ink">Zona de servicio</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{serviceArea || `${municipality} y alrededores`}</p>
            <p className="mt-2 text-xs leading-5 text-muted">Por privacidad, Tenlo no publica la ubicación exacta de profesionales particulares.</p>
          </div>
        </div>
      </section>
    );
  }

  const hasAddress = isUsefulAddress(address);
  const destination = hasAddress ? `${name}, ${address}, ${municipality}` : `${name}, ${municipality}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;

  return (
    <section className="card p-5 md:p-6">
      <div className="flex items-start gap-3">
        <MapPinned className="mt-0.5 shrink-0 text-ink" size={22} aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-ink">Ubicación</h2>
          <p className="mt-2 text-sm font-semibold text-slatecopy">{hasAddress ? address : municipality}</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            {hasAddress ? municipality : "Consulta el resultado en el mapa y confirma la dirección antes de desplazarte."}
          </p>
        </div>
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="btn-secondary mt-4 w-full"
        {...trackingAttrs("map_directions_clicked", { item: itemId, type: itemType, municipality })}
      >
        <Navigation size={17} aria-hidden /> Ver mapa y cómo llegar
      </a>
    </section>
  );
}
