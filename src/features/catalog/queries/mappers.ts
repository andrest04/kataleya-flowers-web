import type { Product } from '@/features/catalog/types';
import type { Product as DomainProduct } from '@/lib/database/repositories/products';

export function mapProductRow(product: DomainProduct): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    categoryId: product.categoryId,
    imageUrl: product.imageUrl,
    images: product.images,
    includes: product.includes,
    occasion: product.occasion ?? undefined,
    note: product.note ?? undefined,
    colors: product.colors,
    flowerTypes: product.flowerTypes,
    isFeatured: product.isFeatured,
    priceTable: product.priceVariants ?? undefined,
  };
}
