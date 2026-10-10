import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryPageView from "@/components/CategoryPageView";
import { categories, findCategory } from "@/lib/mock-data";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = findCategory(slug);
  return {
    title: category?.seoTitle ?? "Categoría | Tenlo",
    description: category?.seoDescription
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) notFound();
  return <CategoryPageView category={category} />;
}
