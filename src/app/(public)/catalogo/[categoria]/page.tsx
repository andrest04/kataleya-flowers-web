import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

import Breadcrumb from "@/components/ui/Breadcrumb";
import { JsonLd } from "@/components/ui/JsonLd";
import { BackButton } from "@/features/catalog/components/BackButton";
import ProductGrid from "@/features/catalog/components/ProductGrid";
import { getCategories } from "@/features/catalog/queries/getCategories";
import { getProductsByCategory } from "@/features/catalog/queries/getProductsByCategory";
import { BUSINESS } from "@/lib/constants";

const SITE_URL = BUSINESS.website;

// ISR backstop: pages refresh instantly on-demand via revalidatePath in admin actions;
// this self-heals any missed path (e.g. color/flower-type renames) within 1 hour.
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
        // El template del root layout agrega `| Kataleya Flawers`.
        title: "Categoría no encontrada",
        description: "La categoría solicitada no existe en nuestro catálogo.",
      };
    }

    const description = category.description.slice(0, 160);
    const ogImages = category.imageUrl ? [category.imageUrl] : undefined;

    return {
      // El template del root layout agrega `| Kataleya Flawers` automáticamente.
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
    return {
      title: "Catálogo",
      description: `Arreglos florales premium en ${BUSINESS.location}.`,
    };
  }
}

export default async function CategoriaPage({
  params,
}: CategoriaPageProps): Promise<React.ReactElement> {
  const [{ categoria }, categories] = await Promise.all([
    params,
    getCategories(),
  ]);
  const category = categories.find((cat) => cat.slug === categoria);

  if (!category) {
    notFound();
  }

  const categoryProducts = await getProductsByCategory(categoria);

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
      className="min-h-screen bg-cream pt-28 pb-12 px-4 sm:px-6 lg:px-8"
    >
      <JsonLd data={[breadcrumbLd, itemListLd]} />
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={[
          { label: 'Inicio', href: '/' },
          { label: 'Catálogo', href: '/catalogo' },
          { label: category.name },
        ]} />

        <div className="mb-8">
          <BackButton label="Volver al catálogo" href="/catalogo" />
        </div>

        <h1 className="font-heading text-4xl md:text-5xl text-primary mb-4">
          {category.name}
        </h1>
        <p className="font-body text-dark/70 text-lg mb-12 max-w-3xl">
          {category.description}
        </p>

        <ProductGrid initialProducts={categoryProducts} categorySlug={category.slug} />
      </div>
    </main>
  );
}
