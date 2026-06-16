import type { PriceVariant, Product } from '@/features/catalog/types';
import type { ProductRow } from '@/lib/db/rows';

export type { ProductRow };

/** Shape returned by PostgREST nested-embed queries in Phase C+ */
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

export function mapProductRow(row: JoinedProductRow): Product {
  const colors = (row.product_color_assignments ?? [])
    .map((a) => a.product_colors?.name)
    .filter((n): n is string => !!n);

  const flowerTypes = (row.product_flower_type_assignments ?? [])
    .map((a) => a.flower_types?.name)
    .filter((n): n is string => !!n);

  const imgs = [...(row.product_images ?? [])].sort(
    (a, b) => a.display_order - b.display_order,
  );
  const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
  // Exclude the primary image so ProductGallery's [imageUrl, ...images] does not duplicate it.
  const gallery = imgs.filter((i) => !i.is_primary).map((i) => i.url);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    categoryId: row.category_id,
    imageUrl: primary?.url ?? '',
    images: gallery,
    includes: (row.includes as string[]) ?? [],
    occasion: row.occasion ?? undefined,
    note: row.note ?? undefined,
    colors,
    flowerTypes,
    priceTable: row.price_variants
      ? (row.price_variants as unknown as PriceVariant[])
      : undefined,
  };
}
