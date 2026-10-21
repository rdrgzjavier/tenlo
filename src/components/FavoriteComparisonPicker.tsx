"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";
import { pushTrackingEvent } from "@/lib/analytics";

export type FavoriteComparisonItem = {
  favoriteId: string;
  targetId: string;
  targetType: "listing" | "center" | "provider";
  title: string;
  href: string;
  category: string;
  municipality: string;
  area: string;
  available: boolean;
};

export default function FavoriteComparisonPicker({ items }: { items: FavoriteComparisonItem[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const comparable = items.filter((item) => item.available);

  function toggle(targetId: string) {
    setSelected((current) => {
      if (current.includes(targetId)) return current.filter((id) => id !== targetId);
      if (current.length >= 3) return current;
      return [...current, targetId];
    });
  }

  function compare() {
    if (selected.length < 2) return;
    pushTrackingEvent("provider_compared", { comparison_count: selected.length });
    router.push(`/comparar?ids=${encodeURIComponent(selected.join(","))}`);
  }

  return (
    <>
      {comparable.length >= 2 ? (
        <div className="sticky top-20 z-20 mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-white/95 p-4 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-ink">Compara hasta 3 opciones</p>
            <p className="mt-1 text-xs text-muted">Seleccionadas: {selected.length}. Necesitas al menos dos.</p>
          </div>
          <button type="button" className="btn-primary min-h-11" disabled={selected.length < 2} onClick={compare}>
            Comparar seleccionadas <ArrowRight size={17} aria-hidden />
          </button>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const checked = selected.includes(item.targetId);
          const selectionDisabled = !item.available || (!checked && selected.length >= 3);
          return (
            <article key={item.favoriteId} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="chip w-fit">{item.category === "centros" ? "Centro" : "Servicio"}</span>
                {item.available ? (
                  <label className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-bold ${checked ? "border-violet bg-lavender/25 text-ink" : "border-line bg-white text-slatecopy"}`}>
                    <input className="sr-only" type="checkbox" checked={checked} disabled={selectionDisabled} onChange={() => toggle(item.targetId)} />
                    <span className="grid h-5 w-5 place-items-center rounded border border-current" aria-hidden>{checked ? <Check size={15} /> : null}</span>
                    Comparar
                  </label>
                ) : null}
              </div>
              <h2 className="mt-4 text-lg font-bold text-slatecopy"><Link href={item.href}>{item.title}</Link></h2>
              <p className="mt-2 text-sm leading-6 text-muted">{item.available ? `${item.municipality} · ${item.area}` : "Esta ficha ya no está disponible en el directorio actual."}</p>
              <div className="mt-auto grid gap-3 pt-5 sm:grid-cols-2">
                <Link href={item.href} className="btn-primary">Ver ficha</Link>
                <FavoriteButton category={item.category} municipality={item.municipality} className="btn-secondary" label="Guardar favorito" targetId={item.targetId} targetType={item.targetType} initialSaved showLabel />
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
