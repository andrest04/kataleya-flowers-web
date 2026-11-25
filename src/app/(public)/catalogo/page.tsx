import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { JsonLd } from '@/components/ui/JsonLd';
import CatalogCategoryStrip from '@/features/catalog/components/CatalogCategoryStrip';
import CatalogCollection from '@/features/catalog/components/CatalogCollection';
import { getCategories } from '@/features/catalog/queries/getCategories';
import { getFlowerTypes } from '@/features/catalog/queries/getFlowerTypes';
import { getProductColors } from '@/features/catalog/queries/getProductColors';
import { getProducts } from '@/features/catalog/queries/getProducts';
import { toCatalogCardProduct } from '@/features/catalog/utils/toCatalogCardProduct';
import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';
import { BUSINESS } from '@/lib/constants';
import { catalogSeoDescription } from '@/lib/siteSettings';

function buildBreadcrumbLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: `${siteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Catálogo',
        item: `${siteUrl}/catalogo`,
      },
    ],
  };
}

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const description = catalogSeoDescription(settings.location);

  return {
    title: 'Catálogo de Flores',
    description,
    alternates: {
      canonical: '/catalogo',
    },
    openGraph: {
      title: 'Catálogo de Flores',
      description,
      url: '/catalogo',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Catálogo de Flores',
      description,
    },
  };
}

export default async function CatalogoPage(): Promise<ReactElement> {
  const [categories, products, colorRows, flowerTypeRows, settings] = await Promise.all([
    getCategories(),
    getProducts(),
    getProductColors(),
    getFlowerTypes(),
    getSiteSettings(),
  ]);
  const SITE_URL = settings.website;
  const categorySlugs = new Map(
    categories.map((category) => [category.id, category.slug]),
  );
  const collectionItems = products.flatMap((product) => {
    const categorySlug = categorySlugs.get(product.categoryId);
    return categorySlug ? [{ product: toCatalogCardProduct(product), categorySlug }] : [];
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
    <main id="main-content" className="min-h-screen overflow-x-clip bg-cream px-2 pb-16 pt-10 sm:px-2 lg:px-3">
      <JsonLd data={[buildBreadcrumbLd(SITE_URL), itemListLd]} />
      <div className="mx-auto max-w-8xl">
        <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
          <h1 className="text-balance font-heading text-4xl leading-tight text-(--color-primary) sm:text-5xl">
            Catálogo de flores y arreglos en {BUSINESS.postalAddress.locality}
          </h1>
        </header>

        <CatalogCategoryStrip categories={categories} />
        <CatalogCollection
          items={collectionItems}
          categories={filterCategories}
          colors={colors}
          flowerTypes={flowerTypes}
        />
      </div>
    </main>
  );
}
