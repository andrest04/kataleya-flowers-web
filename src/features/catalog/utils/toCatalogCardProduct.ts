import type { CatalogCardProduct, Product } from '@/features/catalog/types';

export function toCatalogCardProduct(product: Product): CatalogCardProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    imageUrl: product.imageUrl,
    price: product.price,
    priceTable: product.priceTable,
    colors: product.colors,
    flowerTypes: product.flowerTypes,
    isFeatured: product.isFeatured,
  };
}
