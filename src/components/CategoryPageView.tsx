import Filters from "@/components/Filters";
import ListingCard from "@/components/ListingCard";
import ResponsiveFilterPanel from "@/components/ResponsiveFilterPanel";
import { listings } from "@/lib/mock-data";
import type { Category } from "@/lib/types";
import Link from "next/link";

export default function CategoryPageView({ category }: { category: Category }) {
  const categoryListings = listings.filter((listing) => listing.categoryId === category.id);

  return (
    <div className="page py-10">
      <p className="label">Categoría</p>
      <h1 className="page-title text-ink">{category.name}</h1>
      <p className="mt-3 max-w-3xl text-slatecopy">{category.description}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link className="btn-primary" href="/publicar">Publicar en esta categoría</Link>
      </div>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[280px_1fr]">
        <ResponsiveFilterPanel>
          <Filters selected={{ categoria: category.id }} />
        </ResponsiveFilterPanel>
        <div className="grid content-start items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categoryListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
      </div>
    </div>
  );
}
