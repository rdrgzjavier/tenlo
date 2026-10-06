// Force update: 2026-05-08T12:48
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { communityInitiatives, communityPosts, municipalities } from "@/lib/mock-data";
import { StatusBadge } from "@/components/Badge";
import ResponsiveFilterPanel from "@/components/ResponsiveFilterPanel";
import ValidatedSearchForm from "@/components/ValidatedSearchForm";
import LoadMoreGrid from "@/components/LoadMoreGrid";

export const metadata: Metadata = {
  title: "Eventos, iniciativas y recursos familiares en Madrid noroeste",
  description: "Contenido comunitario revisado para familias: iniciativas locales, eventos familiares, actividades al aire libre, causas y recursos seguros.",
  alternates: { canonical: "/comunidad" },
  openGraph: {
    title: "Comunidad familiar en Madrid noroeste | Tenlo",
    description: "Iniciativas, eventos y recursos comunitarios revisados antes de publicarse.",
    url: "/comunidad"
  }
};

export default function CommunityPage() {
  return (
    <div className="section-shell">
      <p className="label">Participación ciudadana</p>
      <h1 className="page-title">Comunidad Tenlo</h1>
      <p className="lead">Iniciativas, eventos, causas, actividades al aire libre y recursos locales que aportan valor a familias. Todo se revisa antes de publicarse: sin foros abiertos, grupos privados ni datos de menores.</p>

      <section className="mt-8 grid gap-5 rounded-2xl border border-line bg-panel p-5 shadow-soft md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-xl font-bold text-slatecopy">Comparte contenido útil para la comunidad</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Puedes proponer ONGs, carreras solidarias, eventos familiares, actividades al aire libre o iniciativas locales. Para publicar debes iniciar sesión y el equipo de Tenlo revisará el contenido antes de mostrarlo.</p>
        </div>
        <Link href="/publicar?tipo=comunidad" className="btn-primary w-full md:w-auto">Publicar contenido</Link>
      </section>

      <div className="mt-8">
        <ResponsiveFilterPanel>
          <ValidatedSearchForm className="filter-shell sm:grid-cols-[1fr_1fr_1fr_auto]" message="Completa al menos una palabra, zona o tipo de contenido para filtrar.">
            <div className="filter-control">
              <Search size={18} className="text-muted" />
              <input name="tag" aria-label="Buscar contenido de comunidad por palabra o etiqueta" placeholder="Busca por palabra o tag..." className="filter-input" />
            </div>
            <div className="relative">
              <select name="municipio" aria-label="Filtrar comunidad por zona" className="filter-select">
                <option value="">Todas las zonas</option>
                {municipalities.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <ChevronDown size={18} className="text-muted" />
              </div>
            </div>
            <div className="relative">
              <select name="tipo" aria-label="Filtrar comunidad por tipo de contenido" className="filter-select">
                <option value="">Tipo de contenido</option>
                <option>Iniciativas y causas</option>
                <option>Eventos familiares</option>
                <option>Actividades al aire libre</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <ChevronDown size={18} className="text-muted" />
              </div>
            </div>
            <button className="btn-primary px-8" type="submit">Filtrar</button>
          </ValidatedSearchForm>
        </ResponsiveFilterPanel>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="label">Iniciativas y causas</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Proyectos que merece la pena conocer</h2>
          </div>
        </div>
        <LoadMoreGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {communityInitiatives.map((initiative) => (
            <article key={initiative.id} className="card flex h-full flex-col overflow-hidden">
              <Link href={`/comunidad/${initiative.id}`} aria-label={`Ver iniciativa ${initiative.name}`}>
                <img src={initiative.image} alt={`Imagen de ${initiative.name}`} className="h-44 w-full object-cover" loading="lazy" />
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="card-title text-ink"><Link href={`/comunidad/${initiative.id}`}>{initiative.name}</Link></h3>
                <p className="supporting-copy mt-2 line-clamp-3">{initiative.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">{initiative.tags.slice(0, 2).map((tag) => <span key={tag} className="chip">{tag}</span>)}</div>
                <div className="mt-4 grid gap-2 pb-5 text-sm">
                  <p className="font-semibold text-slatecopy">{initiative.municipality}</p>
                  <p className="text-muted">Contenido comunitario revisado</p>
                </div>
                <Link href={`/comunidad/${initiative.id}`} className="btn-primary mt-auto w-full justify-center">Saber más</Link>
              </div>
            </article>
          ))}
        </LoadMoreGrid>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-[1fr_340px]">
        <div className="card divide-y divide-line">
          {communityPosts.map((post) => (
            <article key={post.id} className="p-5">
              <div className="flex flex-wrap gap-2"><span className="chip">{post.category}</span><StatusBadge status={post.status} /></div>
              <h2 className="mt-3 text-xl font-semibold text-ink">{post.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{post.summary}</p>
              <p className="mt-3 text-sm font-semibold text-slatecopy">{post.municipality}</p>
              <Link href="/publicar?tipo=comunidad" className="btn-primary mt-4 w-full justify-center">Saber más</Link>
            </article>
          ))}
        </div>
        <aside className="card h-fit p-5">
          <h2 className="text-xl font-semibold text-ink">Reglas de publicación</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-muted">
            <li>Sin fotos ni datos personales de menores.</li>
            <li>Sin foros, grupos de clase ni conversaciones privadas.</li>
            <li>Solo iniciativas, eventos y recursos con valor comunitario.</li>
            <li>Publicaciones revisadas antes de aparecer.</li>
          </ul>
          <Link href="/publicar?tipo=comunidad" className="btn-primary mt-5 w-full">Publicar contenido</Link>
        </aside>
      </div>
    </div>
  );
}
