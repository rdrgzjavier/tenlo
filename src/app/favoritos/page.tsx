import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import FavoriteComparisonPicker from "@/components/FavoriteComparisonPicker";
import PrivateAreaUnavailable from "@/components/PrivateAreaUnavailable";
import { loadDirectorySnapshot } from "@/lib/directory-repository";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Favoritos | Tenlo",
  description: "Servicios, centros y recursos guardados en tu cuenta de Tenlo."
};

export default async function FavoritesPage() {
  if (!hasSupabaseServerConfig()) return <PrivateAreaUnavailable />;

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) redirect("/login?next=/favoritos");

  const { data: favorites } = await supabase
    .from("favorites")
    .select("id,target_type,target_id,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const snapshot = await loadDirectorySnapshot();
  const listingById = new Map(snapshot.listings.map((listing) => [listing.id, listing]));
  const favoriteItems = (favorites ?? []).map((favorite) => {
    const listing = favorite.target_type === "listing" ? listingById.get(favorite.target_id) : undefined;
    return {
      favoriteId: favorite.id,
      targetId: favorite.target_id,
      targetType: favorite.target_type as "listing" | "center" | "provider",
      title: listing?.title ?? "Ficha guardada",
      href: listing ? `/anuncios/${listing.slug}` : "/buscar",
      category: listing?.categoryId ?? "servicios",
      municipality: listing?.municipality ?? "",
      area: listing?.area ?? "",
      available: Boolean(listing)
    };
  });

  const hasFavorites = Boolean(favorites?.length);

  return (
    <div className="section-shell">
      {hasFavorites ? (
        <>
          <p className="label">Área personal</p>
          <h1 className="page-title">Tus favoritos</h1>
          <p className="lead max-w-4xl">Centros, servicios y recursos que has guardado para compararlos más tarde.</p>
          <FavoriteComparisonPicker items={favoriteItems} />
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
