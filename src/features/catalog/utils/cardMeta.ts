import type { CatalogCardProduct } from '@/features/catalog/types';

const MAX_META_ITEMS = 2;

function capitalize(value: string): string {
  return value.charAt(0).toLocaleUpperCase('es-PE') + value.slice(1);
}

export function getCardMeta(
  product: Pick<CatalogCardProduct, 'flowerTypes' | 'colors' | 'isFeatured'>,
): string | null {
  const flowerTypes = product.flowerTypes ?? [];
  const colors = product.colors ?? [];
  const values = flowerTypes.length > 0 ? flowerTypes : colors;
  if (values.length > 0) return values.slice(0, MAX_META_ITEMS).map(capitalize).join(' · ');
  return product.isFeatured ? 'Destacado' : null;
}
