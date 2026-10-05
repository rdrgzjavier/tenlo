import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Favoritos | Tenlo",
  description: "Servicios, centros y recursos guardados en tu cuenta de Tenlo."
};

export default async function FavoritesPage() {
  const supabase = createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) redirect("/login?next=/favoritos");

  const { data: favorites } = await supabase
    .from("favorites")
    .select("id,target_type,target_id,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const hasFavorites = Boolean(favorites?.length);

  return (
    <div className="section-shell">
      {hasFavorites ? (
        <>
          <p className="label">Área personal</p>
          <h1 className="page-title">Tus favoritos</h1>
          <p className="lead max-w-4xl">Centros, servicios y recursos que has guardado para compararlos más tarde.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favorites?.map((favorite) => (
              <article key={favorite.id} className="card p-5">
                <span className="chip capitalize">{favorite.target_type}</span>
                <h2 className="mt-4 text-lg font-bold text-slatecopy">{favorite.target_id}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">Favorito guardado en tu cuenta Tenlo.</p>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-2xl rounded-[24px] border border-line bg-panel p-8 text-center shadow-soft">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lavender text-ink">
            <Heart size={24} aria-hidden />
          </span>
          <h1 className="mt-5 text-3xl font-bold text-slatecopy">Tus favoritos</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Aquí aparecerán los centros, servicios y recursos que guardes.
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/buscar" className="btn-primary">Buscar servicios</Link>
          </div>
        </div>
      )}
    </div>
  );
}
