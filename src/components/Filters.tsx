import Link from "next/link";
import ValidatedSearchForm from "@/components/ValidatedSearchForm";
import { categories, centers, municipalities, searchTags } from "@/lib/mock-data";

type FiltersProps = {
  selected?: Record<string, string | undefined>;
};

export default function Filters({ selected = {} }: FiltersProps) {
  const featuredTags = searchTags.filter((tag) => ["Público", "Concertado", "Privado", "Bilingüe", "Católico", "Laico", "Guardería", "Robótica", "Natación", "Pádel", "Inglés", "Canguro", "Uniformes", "Material escolar"].includes(tag));

  return (
    <aside className="card h-fit p-5">
      <h2 className="text-lg font-semibold text-ink">Filtros</h2>
      <ValidatedSearchForm className="mt-5 grid gap-4" message="Elige al menos un filtro o escribe una palabra clave." trackingEvent="filter_applied" trackingPlacement="search_filters">
        <label className="field-label">Categoría<select name="categoria" className="field" defaultValue={selected.categoria ?? ""}><option value="">Todas</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="field-label">Municipio<select name="municipio" className="field" defaultValue={selected.municipio ?? ""}><option value="">Todos</option>{municipalities.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}</select></label>
        <label className="field-label">Centro educativo<select name="centro" className="field" defaultValue={selected.centro ?? ""}><option value="">Cualquiera</option>{centers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="field-label">Edad recomendada<select name="edad" className="field" defaultValue={selected.edad ?? ""}><option value="">Todas</option><option value="0-3">0-3 años</option><option value="3-6">3-6 años</option><option value="6-12">6-12 años</option><option value="12-18">12-18 años</option></select></label>
        <label className="field-label">Precio<select name="precio" className="field" defaultValue={selected.precio ?? ""}><option value="">Cualquier precio</option><option value="gratis">Gratis</option><option value="25">Hasta 25 €</option><option value="75">25-75 €</option><option value="mas-75">Más de 75 €</option></select></label>
        <label className="field-label">Tipo<select name="tipo" className="field" defaultValue={selected.tipo ?? ""}><option value="">Todos</option><option value="familia">Familia</option><option value="proveedor">Profesional o actividad</option><option value="centro">Centro</option></select></label>
        <label className="flex items-center gap-2 text-sm font-medium text-slatecopy"><input name="verificado" value="1" type="checkbox" defaultChecked={selected.verificado === "1"} className="h-4 w-4 rounded border-line" /> Solo verificados</label>
        <label className="field-label">Disponibilidad<select name="disponibilidad" className="field" defaultValue={selected.disponibilidad ?? ""}><option value="">Cualquiera</option><option value="semana">Disponible esta semana</option><option value="tardes">Tardes</option><option value="fin-semana">Fin de semana</option><option value="plazas">Plazas abiertas</option></select></label>
        <button className="btn-primary w-full" type="submit">Aplicar filtros</button>
        <Link href="/buscar" className="btn-secondary w-full">Limpiar</Link>
      </ValidatedSearchForm>
      <div className="mt-6 border-t border-line pt-5">
        <p className="text-sm font-semibold text-ink">Tags frecuentes</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {featuredTags.map((tag) => <Link key={tag} href={`/buscar?tag=${encodeURIComponent(tag)}`} className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-slatecopy ring-1 ring-line hover:border-ink hover:text-ink">{tag}</Link>)}
        </div>
      </div>
    </aside>
  );
}
