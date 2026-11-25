import type { MetadataRoute } from "next";

import { getCategories } from "@/features/catalog/queries/getCategories";
import { getSitemapProducts } from "@/features/catalog/queries/getSitemapProducts";
import { getSiteSettings } from "@/features/settings/queries/getSiteSettings";
import { buildSitemapEntries } from "@/lib/sitemapEntries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, categories, products] = await Promise.all([
    getSiteSettings(),
    getCategories().catch(() => []),
    getSitemapProducts().catch(() => []),
  ]);

  return buildSitemapEntries(settings.website, categories, products);
}
