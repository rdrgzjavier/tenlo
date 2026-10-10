import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import { listings } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Favoritos | Tenlo",
  description: "Servicios, centros y recursos guardados en tu cuenta de Tenlo."
};

export default async function FavoritesPage() {
  const supabase = await createSupabaseServerClient();
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
            {favorites?.map((favorite) => {
              const listing = favorite.target_type === "listing" ? listings.find((item) => item.id === favorite.target_id) : undefined;
              const title = listing?.title ?? "Ficha guardada";
              const href = listing ? `/anuncios/${listing.slug}` : "/buscar";

              return (
                <article key={favorite.id} className="card flex flex-col p-5">
                  <span className="chip w-fit">{listing?.categoryId === "centros" ? "Centro" : "Servicio"}</span>
                  <h2 className="mt-4 text-lg font-bold text-slatecopy"><Link href={href}>{title}</Link></h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{listing ? `${listing.municipality} · ${listing.area}` : "Esta ficha ya no está disponible en el directorio actual."}</p>
                  <div className="mt-auto grid gap-3 pt-5 sm:grid-cols-2">
                    <Link href={href} className="btn-primary">Ver ficha</Link>
                    <FavoriteButton className="btn-secondary" label="Guardar favorito" targetId={favorite.target_id} targetType={favorite.target_type as "listing" | "center" | "provider"} initialSaved showLabel />
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-2xl rounded-[24px] border border-line bg-panel p-8 text-center shadow-soft">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lavender text-ink">
            <Heart size={24} aria-hidden />
          </span>
          <h1 className="detail-title mt-5">Tus favoritos</h1>
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
