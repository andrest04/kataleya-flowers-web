import { getProducts } from '@/features/catalog/queries/getProducts';
import type { Product } from '@/features/catalog/types';

const MAX_FEATURED = 4;

/**
 * Productos marcados como destacados en /admin/productos, para la sección
 * "Best sellers" del landing. Filtra en memoria sobre `getProducts()` — al
 * tamaño de catálogo de una florería local no justifica una query dedicada.
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.isFeatured).slice(0, MAX_FEATURED);
}
