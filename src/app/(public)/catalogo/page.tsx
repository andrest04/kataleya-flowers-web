import React, { Suspense } from "react";
import type { Metadata } from "next";
import { BUSINESS } from "@/lib/constants";
import { getCategories } from "@/features/catalog/queries/getCategories";
import { getProducts } from "@/features/catalog/queries/getProducts";
import { getFlowerTypes } from "@/features/catalog/queries/getFlowerTypes";
import { getProductColors } from "@/features/catalog/queries/getProductColors";
import CatalogSearch from "@/features/catalog/components/CatalogSearch";
import BreadcrumbNav from "@/components/ui/Breadcrumb";
import CategoryCard from "@/features/catalog/components/CategoryCard";

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

  // Grid de categorías renderizado por el server: se pasa como children al
  // client component y se muestra cuando no hay filtros activos. Evita el
  // grid duplicado entre fallback SSR y client (single source of truth).
  const categoryGrid = (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );

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

        <Suspense fallback={categoryGrid}>
          <CatalogSearch
            categories={categories}
            products={products}
            flowerTypes={flowerTypeRows.map((ft) => ft.name)}
            productColors={colorRows}
          >
            {categoryGrid}
          </CatalogSearch>
        </Suspense>
      </div>
    </main>
  );
}
