import type { Metadata } from "next";
import React, { Suspense } from "react";

import BreadcrumbNav from "@/components/ui/Breadcrumb";
import { JsonLd } from "@/components/ui/JsonLd";
import CatalogSearch from "@/features/catalog/components/CatalogSearch";
import CategoryCard from "@/features/catalog/components/CategoryCard";
import { getCategories } from "@/features/catalog/queries/getCategories";
import { getFlowerTypes } from "@/features/catalog/queries/getFlowerTypes";
import { getProductColors } from "@/features/catalog/queries/getProductColors";
import { getProducts } from "@/features/catalog/queries/getProducts";
import { BUSINESS } from "@/lib/constants";

const SITE_URL = BUSINESS.website;

const BREADCRUMB_LD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Inicio",
      item: `${SITE_URL}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Catálogo",
      item: `${SITE_URL}/catalogo`,
    },
  ],
};

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Catálogo de Flores",
  description: `Explora nuestro catálogo de arreglos florales, orquídeas y regalos premium disponibles en ${BUSINESS.location}.`,
  alternates: {
    canonical: "/catalogo",
  },
  openGraph: {
    title: "Catálogo de Flores",
    description: `Explora nuestro catálogo de arreglos florales, orquídeas y regalos premium disponibles en ${BUSINESS.location}.`,
    url: "/catalogo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Catálogo de Flores",
    description: `Explora nuestro catálogo de arreglos florales, orquídeas y regalos premium disponibles en ${BUSINESS.location}.`,
  },
};

export default async function CatalogoPage(): Promise<React.ReactElement> {
  const [categories, products, flowerTypeRows, colorRows] = await Promise.all([
    getCategories(),
    getProducts(),
    getFlowerTypes(),
    getProductColors(),
  ]);

  const categoryGrid = (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: categories.map((cat, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/catalogo/${cat.slug}`,
      name: cat.name,
    })),
  };

  return (
    <main
      id="main-content"
      className="min-h-screen bg-cream pt-28 pb-12 px-4 sm:px-6 lg:px-8"
    >
      <JsonLd data={[BREADCRUMB_LD, itemListLd]} />
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
