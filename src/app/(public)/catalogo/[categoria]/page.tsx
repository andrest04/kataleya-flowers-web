import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

import Breadcrumb from "@/components/ui/Breadcrumb";
import { JsonLd } from "@/components/ui/JsonLd";
import CatalogCollection from "@/features/catalog/components/CatalogCollection";
import { getCategories } from "@/features/catalog/queries/getCategories";
import { getFlowerTypes } from "@/features/catalog/queries/getFlowerTypes";
import { getProductColors } from "@/features/catalog/queries/getProductColors";
import { getProductsByCategory } from "@/features/catalog/queries/getProductsByCategory";
import { getSiteSettings } from "@/features/settings/queries/getSiteSettings";
import { BUSINESS } from "@/lib/constants";
import { floralArrangementsSeoDescription } from "@/lib/siteSettings";

const SITE_URL = BUSINESS.website;

export const revalidate = 3600;

interface CategoriaPageProps {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export async function generateStaticParams(): Promise<{ categoria: string }[]> {
  try {
    const categories = await getCategories();
    return categories.map((category) => ({
      categoria: category.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: CategoriaPageProps): Promise<Metadata> {
  const { categoria } = await params;

  try {
    const categories = await getCategories();
    const category = categories.find((cat) => cat.slug === categoria);

    if (!category) {
      return {
        title: "Categoría no encontrada",
        description: "La categoría solicitada no existe en nuestro catálogo.",
      };
    }

    const description = category.description.slice(0, 160);
    const ogImages = category.imageUrl ? [category.imageUrl] : undefined;

    return {
      title: `${category.name} | Catálogo`,
      description,
      alternates: {
        canonical: `/catalogo/${categoria}`,
      },
      openGraph: {
        title: `${category.name} | Catálogo`,
        description,
        url: `/catalogo/${categoria}`,
        type: "website",
        images: ogImages,
      },
      twitter: {
        card: "summary_large_image",
        title: `${category.name} | Catálogo`,
        description,
        images: ogImages,
      },
    };
  } catch {
    const settings = await getSiteSettings();
    return {
      title: "Catálogo",
      description: floralArrangementsSeoDescription(settings.location),
    };
  }
}

export default async function CategoriaPage({
  params,
  searchParams,
}: CategoriaPageProps): Promise<React.ReactElement> {
  const [{ categoria }, categories, resolvedSearchParams] = await Promise.all([
    params,
    getCategories(),
    searchParams,
  ]);
  const category = categories.find((cat) => cat.slug === categoria);

  if (!category) {
    notFound();
  }

  const [categoryProducts, colorRows, flowerTypeRows] = await Promise.all([
    getProductsByCategory(categoria),
    getProductColors(),
    getFlowerTypes(),
  ]);

  const collectionItems = categoryProducts.map((product) => ({
    product,
    categorySlug: category.slug,
  }));
  const assignedColors = new Set(
    categoryProducts.flatMap((product) => product.colors ?? []),
  );
  const assignedFlowerTypes = new Set(
    categoryProducts.flatMap((product) => product.flowerTypes ?? []),
  );
  const colors = colorRows.filter(({ name }) => assignedColors.has(name));
  const flowerTypes = flowerTypeRows
    .map(({ name }) => name)
    .filter((name) => assignedFlowerTypes.has(name));
  const initialQuery = {
    category: "",
    priceMin: firstParam(resolvedSearchParams.precio_min),
    priceMax: firstParam(resolvedSearchParams.precio_max),
    colors: firstParam(resolvedSearchParams.color),
    flowerTypes: firstParam(resolvedSearchParams.tipo),
    sort: firstParam(resolvedSearchParams.orden),
  };

  const breadcrumbLd = {
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
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `${SITE_URL}/catalogo/${category.slug}`,
      },
    ],
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: categoryProducts.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/catalogo/${category.slug}/${product.slug}`,
      name: product.name,
    })),
  };

  return (
    <main
      id="main-content"
      className="min-h-screen bg-cream px-2 pb-16 pt-10 sm:px-2 lg:px-3"
    >
      <JsonLd data={[breadcrumbLd, itemListLd]} />
      <div className="-mx-2 px-4 sm:-mx-2 sm:px-6 lg:-mx-3 lg:px-10">
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Catálogo", href: "/catalogo" },
            { label: category.name },
          ]}
        />
      </div>
      <div className="mx-auto max-w-8xl">
        <header className="mx-auto mb-10 max-w-4xl text-center sm:mb-12">
          <h1 className="text-balance font-heading text-4xl leading-tight text-(--color-primary) sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-4 font-body text-base text-(--color-muted) sm:text-lg">
            {category.description}
          </p>
        </header>

        <CatalogCollection
          items={collectionItems}
          categories={[]}
          colors={colors}
          flowerTypes={flowerTypes}
          initialQuery={initialQuery}
        />
      </div>
    </main>
  );
}
