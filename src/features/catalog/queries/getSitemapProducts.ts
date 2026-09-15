import { productsRepository } from '@/lib/database/repositories/products';

export interface SitemapProduct {
  slug: string;
  categorySlug: string;
  updatedAt: string | null;
}

export async function getSitemapProducts(): Promise<SitemapProduct[]> {
  return productsRepository.listSitemap();
}
