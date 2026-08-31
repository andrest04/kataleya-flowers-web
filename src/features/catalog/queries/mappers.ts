import type { PriceVariant, Product } from '@/features/catalog/types';
import type { ProductRow } from '@/lib/db/rows';

export type { ProductRow };

export type JoinedProductRow = ProductRow & {
  product_color_assignments:
    | { product_colors: { name: string } | null }[]
    | null;
  product_flower_type_assignments:
    | { flower_types: { name: string } | null }[]
    | null;
  product_images:
    | {
        url: string;
        alt_text: string | null;
        is_primary: boolean;
        display_order: number;
      }[]
    | null;
};

export function deriveProductImages(
  productImages: JoinedProductRow['product_images'],
): { imageUrl: string; gallery: string[] } {
  const imgs = [...(productImages ?? [])].sort(
    (a, b) => a.display_order - b.display_order,
  );
  const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
  const gallery = imgs.flatMap((i) => (i.is_primary ? [] : [i.url]));
  return { imageUrl: primary?.url ?? '', gallery };
}

export function mapProductRow(row: JoinedProductRow): Product {
  const colors = (row.product_color_assignments ?? [])
    .map((a) => a.product_colors?.name)
    .filter((n): n is string => !!n);

  const flowerTypes = (row.product_flower_type_assignments ?? [])
    .map((a) => a.flower_types?.name)
    .filter((n): n is string => !!n);

  const { imageUrl, gallery } = deriveProductImages(row.product_images);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    categoryId: row.category_id,
    imageUrl,
    images: gallery,
    includes: (row.includes as string[]) ?? [],
    occasion: row.occasion ?? undefined,
    note: row.note ?? undefined,
    colors,
    flowerTypes,
    isFeatured: row.is_featured,
    priceTable: row.price_variants
      ? (row.price_variants as unknown as PriceVariant[])
      : undefined,
  };
}
