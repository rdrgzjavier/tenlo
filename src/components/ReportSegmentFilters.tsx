import Link from "next/link";
import type { ReportPeriod } from "@/components/ReportPeriodSelector";

type ReportSegmentFiltersProps = {
  activeCategory: string;
  activeMunicipality: string;
  activePeriod: ReportPeriod;
  categoryOptions: string[];
  municipalityOptions: string[];
  pathname: string;
};

export default function ReportSegmentFilters({
  activeCategory,
  activeMunicipality,
  activePeriod,
  categoryOptions,
  municipalityOptions,
  pathname
}: ReportSegmentFiltersProps) {
  const hasFilters = Boolean(activeCategory || activeMunicipality);

  return (
    <form action={pathname} method="get" className="mt-4 rounded-2xl border border-line bg-soft p-4" aria-label="Filtros del informe">
      <input type="hidden" name="period" value={activePeriod} />
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] md:items-end">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Categoría
          <select name="category" defaultValue={activeCategory} className="min-h-11 rounded-xl border border-line bg-white px-3 text-base font-normal text-ink">
            <option value="">Todas las categorías</option>
            {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Municipio
          <select name="municipality" defaultValue={activeMunicipality} className="min-h-11 rounded-xl border border-line bg-white px-3 text-base font-normal text-ink">
            <option value="">Todos los municipios</option>
            {municipalityOptions.map((municipality) => <option key={municipality} value={municipality}>{municipality}</option>)}
          </select>
        </label>
        <button type="submit" className="btn-primary min-h-11 px-5">Aplicar</button>
        {hasFilters ? <Link href={`${pathname}?period=${activePeriod}`} className="btn-secondary min-h-11 px-5">Limpiar</Link> : null}
      </div>
    </form>
  );
}
