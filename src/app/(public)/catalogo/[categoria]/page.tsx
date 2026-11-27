import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

import Breadcrumb from "@/components/ui/Breadcrumb";
import { JsonLd } from "@/components/ui/JsonLd";
import CatalogCategoryStrip from "@/features/catalog/components/CatalogCategoryStrip";
import CatalogCollection from "@/features/catalog/components/CatalogCollection";
import { getCategories } from "@/features/catalog/queries/getCategories";
import { getFlowerTypes } from "@/features/catalog/queries/getFlowerTypes";
import { getProductColors } from "@/features/catalog/queries/getProductColors";
import { getProductsByCategory } from "@/features/catalog/queries/getProductsByCategory";
import { toCatalogCardProduct } from "@/features/catalog/utils/toCatalogCardProduct";
import { getSiteSettings } from "@/features/settings/queries/getSiteSettings";
import { BUSINESS } from "@/lib/constants";
import { truncateOnWord } from "@/lib/seoText";
import { defaultWhatsappHref, floralArrangementsSeoDescription } from "@/lib/siteSettings";

export const revalidate = 3600;

interface CategoriaPageProps {
  params: Promise<{ categoria: string }>;
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

    const description = truncateOnWord(category.description, 160);
    const ogImages = category.imageUrl ? [category.imageUrl] : undefined;
    const title = `${category.name} a domicilio en ${BUSINESS.postalAddress.locality}`;

    return {
      title,
      description,
      alternates: {
        canonical: `/catalogo/${categoria}`,
      },
      openGraph: {
        title,
        description,
        url: `/catalogo/${categoria}`,
        type: "website",
        images: ogImages,
      },
      twitter: {
        card: "summary_large_image",
        title,
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
}: CategoriaPageProps): Promise<React.ReactElement> {
  const [{ categoria }, categories, settings] = await Promise.all([
    params,
    getCategories(),
    getSiteSettings(),
  ]);
  const SITE_URL = settings.website;
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
    product: toCatalogCardProduct(product),
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
      className="min-h-screen overflow-x-clip bg-cream px-2 pb-16 pt-10 sm:px-2 lg:px-3"
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
        <header className="mx-auto mb-6 max-w-4xl text-center sm:mb-8">
          <h1 className="text-balance font-heading text-3xl leading-tight text-(--color-primary) sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-4 font-body text-base text-(--color-muted) sm:text-lg">
            {category.description}
          </p>
        </header>

        <CatalogCategoryStrip categories={categories} activeSlug={category.slug} />
        <CatalogCollection
          items={collectionItems}
          categories={[]}
          colors={colors}
          flowerTypes={flowerTypes}
          whatsappHref={defaultWhatsappHref(settings)}
          relatedCategories={categories.filter((cat) => cat.id !== category.id)}
          showCatalogLink
        />
      </div>
    </main>
  );
}
