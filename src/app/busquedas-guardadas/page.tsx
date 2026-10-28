import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookmarkPlus, Search } from "lucide-react";
import PrivateAreaUnavailable from "@/components/PrivateAreaUnavailable";
import SavedSearchActions from "@/components/SavedSearchActions";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Búsquedas guardadas | Tenlo",
  description: "Recupera las búsquedas de recursos y servicios que has guardado en Tenlo.",
  robots: { index: false, follow: false }
};

export default async function SavedSearchesPage() {
  if (!hasSupabaseServerConfig()) return <PrivateAreaUnavailable />;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=/busquedas-guardadas");

  const { data: searches, error } = await supabase
    .from("saved_searches")
    .select("id,name,search_path,category_id,municipality,created_at")
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="section-shell">
      <p className="label">Área personal</p>
      <h1 className="page-title">Búsquedas guardadas</h1>
      <p className="lead max-w-4xl">Retoma tus filtros sin empezar de cero y comprueba si hay nuevas opciones para tu familia.</p>

      {error ? (
        <div className="card mt-8 p-6" role="alert">
          <h2 className="text-xl font-bold text-slatecopy">No hemos podido cargar tus búsquedas</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Inténtalo de nuevo dentro de unos minutos.</p>
        </div>
      ) : searches?.length ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {searches.map((search) => (
            <article key={search.id} className="card p-6">
              <BookmarkPlus size={25} className="text-ink" aria-hidden />
              <h2 className="mt-4 text-xl font-bold text-slatecopy">{search.name}</h2>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-muted">
                {search.municipality ? <span className="chip">{search.municipality}</span> : null}
                {search.category_id ? <span className="chip">{search.category_id}</span> : null}
              </div>
              <p className="mt-4 text-xs text-muted">Guardada el {new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(new Date(search.created_at))}</p>
              <SavedSearchActions id={search.id} href={search.search_path} category={search.category_id} municipality={search.municipality} />
            </article>
          ))}
        </div>
      ) : (
        <div className="card mt-8 p-6 md:p-8">
          <Search size={28} className="text-ink" aria-hidden />
          <h2 className="mt-4 text-2xl font-bold text-slatecopy">Todavía no has guardado búsquedas</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Cuando encuentres unos filtros útiles, guárdalos desde la página de resultados para volver con un solo toque.</p>
          <Link href="/buscar" className="btn-primary mt-6">Buscar recursos</Link>
        </div>
      )}
    </div>
  );
}
