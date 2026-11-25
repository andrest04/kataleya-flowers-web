import type { MetadataRoute } from 'next';

type SitemapEntry = MetadataRoute.Sitemap[number];

export interface SitemapCategoryInput {
  slug: string;
}

export interface SitemapProductInput {
  slug: string;
  categorySlug: string;
  updatedAt: string | null;
}

function toDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function newest(dates: Iterable<Date | undefined>): Date | undefined {
  let latest: Date | undefined;
  for (const date of dates) {
    if (date && (!latest || date.getTime() > latest.getTime())) latest = date;
  }
  return latest;
}

function withLastModified(entry: SitemapEntry, lastModified: Date | undefined): SitemapEntry {
  return lastModified ? { ...entry, lastModified } : entry;
}

export function buildSitemapEntries(
  siteUrl: string,
  categories: readonly SitemapCategoryInput[],
  products: readonly SitemapProductInput[],
): MetadataRoute.Sitemap {
  const datedProducts = products.map((product) => ({
    product,
    updatedAt: toDate(product.updatedAt),
  }));

  const newestByCategory = new Map<string, Date>();
  for (const { product, updatedAt } of datedProducts) {
    const latest = newest([newestByCategory.get(product.categorySlug), updatedAt]);
    if (latest) newestByCategory.set(product.categorySlug, latest);
  }

  const siteLastModified = newest(newestByCategory.values());

  const staticEntries: MetadataRoute.Sitemap = [
    withLastModified(
      { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1.0 },
      siteLastModified,
    ),
    withLastModified(
      { url: `${siteUrl}/catalogo`, changeFrequency: 'weekly', priority: 0.9 },
      siteLastModified,
    ),
    { url: `${siteUrl}/libro-de-reclamaciones`, changeFrequency: 'yearly', priority: 0.4 },
  ];

  const categoryEntries = categories.map((category) =>
    withLastModified(
      { url: `${siteUrl}/catalogo/${category.slug}`, changeFrequency: 'weekly', priority: 0.8 },
      newestByCategory.get(category.slug),
    ),
  );

  const productEntries = datedProducts.map(({ product, updatedAt }) =>
    withLastModified(
      {
        url: `${siteUrl}/catalogo/${product.categorySlug}/${product.slug}`,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      updatedAt,
    ),
  );

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
