import { listSitemapProducts } from "@/lib/appwrite/repositories/products";

/**
 * Datos mínimos por producto que el sitemap necesita:
 * - slug del producto
 * - slug de la categoría (para construir la URL anidada)
 * - updated_at para el `lastModified`
 *
 * Esta query existe específicamente para `app/sitemap.ts`. No expone el shape
 * completo de `Product` porque el sitemap no lo necesita y queremos mantener
 * el payload lo más liviano posible.
 */
export interface SitemapProduct {
  slug: string;
  categorySlug: string;
  updatedAt: string | null;
}

export async function getSitemapProducts(): Promise<SitemapProduct[]> {
  return listSitemapProducts();
}
