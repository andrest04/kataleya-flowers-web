import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { JsonLd } from '@/components/ui/JsonLd';
import CatalogCategoryStrip from '@/features/catalog/components/CatalogCategoryStrip';
import CatalogCollection from '@/features/catalog/components/CatalogCollection';
import { getCategories } from '@/features/catalog/queries/getCategories';
import { getFlowerTypes } from '@/features/catalog/queries/getFlowerTypes';
import { getProductColors } from '@/features/catalog/queries/getProductColors';
import { getProducts } from '@/features/catalog/queries/getProducts';
import { BUSINESS } from '@/lib/constants';

const SITE_URL = BUSINESS.website;

const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Inicio',
      item: `${SITE_URL}/`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Catálogo',
      item: `${SITE_URL}/catalogo`,
    },
  ],
};

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Catálogo de Flores',
  description: `Explora nuestro catálogo de arreglos florales, orquídeas y regalos premium disponibles en ${BUSINESS.location}.`,
  alternates: {
    canonical: '/catalogo',
  },
  openGraph: {
    title: 'Catálogo de Flores',
    description: `Explora nuestro catálogo de arreglos florales, orquídeas y regalos premium disponibles en ${BUSINESS.location}.`,
    url: '/catalogo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catálogo de Flores',
    description: `Explora nuestro catálogo de arreglos florales, orquídeas y regalos premium disponibles en ${BUSINESS.location}.`,
  },
};

interface CatalogoPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default async function CatalogoPage({
  searchParams,
}: CatalogoPageProps): Promise<ReactElement> {
  const [categories, products, colorRows, flowerTypeRows, params] = await Promise.all([
    getCategories(),
    getProducts(),
    getProductColors(),
    getFlowerTypes(),
    searchParams,
  ]);
  const categorySlugs = new Map(
    categories.map((category) => [category.id, category.slug]),
  );
  const collectionItems = products.flatMap((product) => {
    const categorySlug = categorySlugs.get(product.categoryId);
    return categorySlug ? [{ product, categorySlug }] : [];
  });
  const assignedCategoryIds = new Set(
    collectionItems.map(({ product }) => product.categoryId),
  );
  const filterCategories = categories.filter(({ id }) => assignedCategoryIds.has(id));
  const assignedColors = new Set(
    collectionItems.flatMap(({ product }) => product.colors ?? []),
  );
  const assignedFlowerTypes = new Set(
    collectionItems.flatMap(({ product }) => product.flowerTypes ?? []),
  );
  const colors = colorRows.filter(({ name }) => assignedColors.has(name));
  const flowerTypes = flowerTypeRows
    .map(({ name }) => name)
    .filter((name) => assignedFlowerTypes.has(name));
  const initialQuery = {
    category: firstParam(params.categoria),
    priceMin: firstParam(params.precio_min),
    priceMax: firstParam(params.precio_max),
    colors: firstParam(params.color),
    flowerTypes: firstParam(params.tipo),
    sort: firstParam(params.orden),
  };
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: collectionItems.map(({ product, categorySlug }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/catalogo/${categorySlug}/${product.slug}`,
      name: product.name,
    })),
  };

  return (
    <main id="main-content" className="min-h-screen bg-cream px-2 pb-16 pt-10 sm:px-2 lg:px-3">
      <JsonLd data={[BREADCRUMB_LD, itemListLd]} />
      <div className="mx-auto max-w-8xl">
        <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
          <h1 className="text-balance font-heading text-4xl leading-tight text-(--color-primary) sm:text-5xl">
            Flores para cada momento
          </h1>
        </header>

        <CatalogCategoryStrip categories={categories} />
        <CatalogCollection
          items={collectionItems}
          categories={filterCategories}
          colors={colors}
          flowerTypes={flowerTypes}
          initialQuery={initialQuery}
        />
      </div>
    </main>
  );
}
