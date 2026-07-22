import type { MetadataRoute } from "next";

import { getCategories } from "@/features/catalog/queries/getCategories";
import { getSitemapProducts } from "@/features/catalog/queries/getSitemapProducts";
import { BUSINESS } from "@/lib/constants";

const SITE_URL = BUSINESS.website;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/catalogo`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/libro-de-reclamaciones`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let categoryEntries: MetadataRoute.Sitemap = [];
  let productEntries: MetadataRoute.Sitemap = [];

  try {
    const categories = await getCategories();
    categoryEntries = categories.map((category) => ({
      url: `${SITE_URL}/catalogo/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    categoryEntries = [];
  }

  try {
    const products = await getSitemapProducts();
    productEntries = products.map((product) => ({
      url: `${SITE_URL}/catalogo/${product.categorySlug}/${product.slug}`,
      lastModified: product.updatedAt
        ? new Date(product.updatedAt)
        : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    productEntries = [];
  }

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
