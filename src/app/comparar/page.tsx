import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { loadDirectorySnapshot } from "@/lib/directory-repository";
import { trustLevelLabel } from "@/lib/display-labels";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comparar opciones | Tenlo",
  description: "Compara servicios y centros guardados con criterios homogéneos.",
  robots: { index: false, follow: false }
};

function ageLabel(min?: number, max?: number) {
  if (min === undefined && max === undefined) return "Pendiente de verificar";
  if (min !== undefined && max !== undefined) return `${min}-${max} años`;
  if (min !== undefined) return `Desde ${min} años`;
  return `Hasta ${max} años`;
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const { ids = "" } = await searchParams;
  const requestedIds = [...new Set(ids.split(",").map((id) => id.trim()).filter(Boolean))].slice(0, 3);
  const snapshot = await loadDirectorySnapshot();
  const byId = new Map(snapshot.listings.map((listing) => [listing.id, listing]));
  const options = requestedIds.map((id) => byId.get(id)).filter((item) => item !== undefined);

  if (options.length < 2) {
    return (
      <div className="section-shell">
        <div className="mx-auto max-w-2xl rounded-[24px] border border-line bg-panel p-8 text-center shadow-soft">
          <h1 className="detail-title">Elige al menos dos opciones</h1>
          <p className="mt-3 text-sm leading-6 text-muted">Guarda servicios o centros en favoritos y selecciona entre dos y tres para compararlos.</p>
          <Link href="/favoritos" className="btn-primary mt-6">Volver a favoritos</Link>
        </div>
      </div>
    );
  }

  const fields = [
    { label: "Categoría", value: (item: (typeof options)[number]) => item.categoryId },
    { label: "Municipio", value: (item: (typeof options)[number]) => item.municipality || "Pendiente de verificar" },
    { label: "Zona de servicio", value: (item: (typeof options)[number]) => item.area || "Pendiente de verificar" },
    { label: "Edad recomendada", value: (item: (typeof options)[number]) => ageLabel(item.recommendedAgeMin, item.recommendedAgeMax) },
    { label: "Precio", value: (item: (typeof options)[number]) => item.priceLabel || (item.price !== undefined ? `${item.price} €` : "Pendiente de verificar") },
    { label: "Disponibilidad", value: (item: (typeof options)[number]) => item.availability || "Pendiente de verificar" },
    { label: "Confianza", value: (item: (typeof options)[number]) => trustLevelLabel(item.trustLevel) },
    { label: "Última revisión", value: (item: (typeof options)[number]) => item.lastReviewed || "Pendiente de verificar" }
  ];

  return (
    <div className="section-shell">
      <Link href="/favoritos" className="inline-flex items-center gap-2 font-bold text-ink underline"><ArrowLeft size={17} aria-hidden />Volver a favoritos</Link>
      <p className="label mt-6">Decisión informada</p>
      <h1 className="page-title">Compara tus opciones</h1>
      <p className="lead max-w-4xl">Mismos criterios para detectar qué información está disponible y qué debes confirmar directamente con cada entidad.</p>

      <div className="mt-8 overflow-x-auto rounded-[24px] border border-line bg-white shadow-soft">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-soft">
              <th className="w-44 p-4 text-sm text-muted">Criterio</th>
              {options.map((item) => <th key={item.id} className="min-w-56 p-4 text-lg font-bold text-ink">{item.title}</th>)}
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.label} className="border-b border-line last:border-b-0">
                <th className="p-4 text-sm font-bold text-ink">{field.label}</th>
                {options.map((item) => <td key={item.id} className="p-4 text-sm leading-6 text-slatecopy">{field.value(item)}</td>)}
              </tr>
            ))}
            <tr>
              <th className="p-4 text-sm font-bold text-ink">Siguiente paso</th>
              {options.map((item) => (
                <td key={item.id} className="p-4">
                  <Link className="btn-primary w-full" href={`/anuncios/${item.slug}`}><CheckCircle2 size={17} aria-hidden />Ver ficha</Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted">Tenlo organiza información disponible, pero precio, disponibilidad y condiciones deben confirmarse con la entidad antes de decidir.</p>
    </div>
  );
}
