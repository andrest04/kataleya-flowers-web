import { listSitemapProducts } from "@/lib/appwrite/repositories/products";

export interface SitemapProduct {
  slug: string;
  categorySlug: string;
  updatedAt: string | null;
}

export async function getSitemapProducts(): Promise<SitemapProduct[]> {
  return listSitemapProducts();
}
