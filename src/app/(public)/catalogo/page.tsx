import React, { Suspense } from "react";
import type { Metadata } from "next";
import { BUSINESS } from "@/lib/constants";
import type { Category } from "@/features/catalog/types";
import { getCategories } from "@/features/catalog/queries/getCategories";
import { getProducts } from "@/features/catalog/queries/getProducts";
import { getFlowerTypes } from "@/features/catalog/queries/getFlowerTypes";
import { getProductColors } from "@/features/catalog/queries/getProductColors";
import CatalogSearch from "@/features/catalog/components/CatalogSearch";
import BreadcrumbNav from "@/components/ui/Breadcrumb";
import CategoryCard from "@/features/catalog/components/CategoryCard";

// Static fallback: category grid rendered server-side while the client
// component loads (needed because CatalogSearch uses useSearchParams)
function CategoryGridFallback({
  categories,
}: {
  categories: Category[];
}): React.ReactElement {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}

export const metadata: Metadata = {
  title: `Catalogo de Flores | ${BUSINESS.name}`,
  description:
    `Explora nuestro catalogo de arreglos florales, orquideas y regalos premium disponibles en ${BUSINESS.location}.`,
};

export default async function CatalogoPage(): Promise<React.ReactElement> {
  const [categories, products, flowerTypeRows, colorRows] = await Promise.all([
    getCategories(),
    getProducts(),
    getFlowerTypes(),
    getProductColors(),
  ]);

  return (
    <main className="min-h-screen bg-cream pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <BreadcrumbNav items={[
          { label: 'Inicio', href: '/' },
          { label: 'Catálogo' },
        ]} />

        <h1 className="font-heading text-4xl md:text-5xl text-primary text-center mb-12">
          Nuestro Catálogo
        </h1>

        <Suspense fallback={<CategoryGridFallback categories={categories} />}>
          <CatalogSearch categories={categories} products={products} flowerTypes={flowerTypeRows.map((ft) => ft.name)} productColors={colorRows} />
        </Suspense>
      </div>
    </main>
  );
}
