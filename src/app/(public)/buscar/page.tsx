import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { JsonLd } from '@/components/ui/JsonLd';
import SearchPage from '@/features/catalog/components/SearchPage';
import {
  applySearchFilters,
  firstParam,
  sortProducts,
  toCollectionItems,
} from '@/features/catalog/components/SearchPage/applySearchQuery';
import { getCategories } from '@/features/catalog/queries/getCategories';
import { getFeaturedProducts } from '@/features/catalog/queries/getFeaturedProducts';
import { getFlowerTypes } from '@/features/catalog/queries/getFlowerTypes';
import { getProductColors } from '@/features/catalog/queries/getProductColors';
import { getProducts } from '@/features/catalog/queries/getProducts';
import { getEffectivePrice } from '@/features/catalog/utils/filterProducts';
import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';

const FREQUENT_LIMIT = 4;

export const revalidate = 3600;

interface BuscarPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: BuscarPageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = firstParam(params.q).trim();
  const title = q ? `Buscar “${q}”` : 'Buscar';
  const description = q
    ? `Resultados para “${q}” en el catálogo de arreglos florales.`
    : 'Busca ramos y arreglos florales para tu ocasión.';
  const canonical = '/buscar';

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function BuscarPage({
  searchParams,
}: BuscarPageProps): Promise<ReactElement> {
  const [categories, products, featured, colorRows, flowerTypeRows, params, settings] =
    await Promise.all([
      getCategories(),
      getProducts(),
      getFeaturedProducts(),
      getProductColors(),
      getFlowerTypes(),
      searchParams,
      getSiteSettings(),
    ]);
  const SITE_URL = settings.website;

  const q = firstParam(params.q).trim();
  const prices = products.map(getEffectivePrice);
  const maximumPrice = prices.length > 0 ? Math.max(0, ...prices) : 0;
  const slugByCategoryId = new Map(
    categories.map((category) => [category.id, category.slug]),
  );
  const filtered = applySearchFilters(products, categories, {
    q,
    categorySlugs: [],
    precioMin: 0,
    precioMax: maximumPrice,
    colors: [],
    flowerTypes: [],
  });
  const results = toCollectionItems(sortProducts(filtered, 'featured'), slugByCategoryId);
  const assignedCategoryIds = new Set(results.map(({ product }) => product.categoryId));
  const filterCategories = categories.filter(({ id }) => assignedCategoryIds.has(id));
  const assignedColors = new Set(results.flatMap(({ product }) => product.colors ?? []));
  const assignedFlowerTypes = new Set(
    results.flatMap(({ product }) => product.flowerTypes ?? []),
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

  const productCountByCategory = new Map<string, number>();
  for (const product of products) {
    productCountByCategory.set(
      product.categoryId,
      (productCountByCategory.get(product.categoryId) ?? 0) + 1,
    );
  }
  const frequentCategories = [...categories]
    .sort((left, right) => {
      const featuredDelta = Number(Boolean(right.isFeatured)) - Number(Boolean(left.isFeatured));
      if (featuredDelta !== 0) return featuredDelta;
      return (
        (productCountByCategory.get(right.id) ?? 0) -
        (productCountByCategory.get(left.id) ?? 0)
      );
    })
    .slice(0, FREQUENT_LIMIT);

  const suggestionSource = [...featured, ...products]
    .filter((product, index, list) => list.findIndex((item) => item.id === product.id) === index)
    .slice(0, 8);
  const suggestionItems = toCollectionItems(suggestionSource, slugByCategoryId);

  const breadcrumbLd = {
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
        name: 'Buscar',
        item: `${SITE_URL}/buscar`,
      },
    ],
  };
  const itemListLd =
    q && results.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: results.map(({ product, categorySlug }, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_URL}/catalogo/${categorySlug}/${product.slug}`,
            name: product.name,
          })),
        }
      : null;

  return (
    <>
      <JsonLd data={itemListLd ? [breadcrumbLd, itemListLd] : [breadcrumbLd]} />
      <SearchPage
        query={q}
        results={results}
        suggestionItems={suggestionItems}
        frequentCategories={frequentCategories}
        filterCategories={filterCategories}
        colors={colors}
        flowerTypes={flowerTypes}
        initialQuery={initialQuery}
      />
    </>
  );
}
