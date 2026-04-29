import type { Product } from '@/features/catalog/types';
import type { Database } from '@/lib/supabase/types';

export type ProductRow = Database['public']['Tables']['products']['Row'];

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    categoryId: row.category_id,
    imageUrl: row.image_url,
    images: row.images ?? [],
    includes: (row.includes as string[]) ?? [],
    occasion: row.occasion ?? undefined,
    note: row.note ?? undefined,
    colors: row.colors ?? [],
    flowerTypes: row.flower_types ?? [],
    priceTable: row.price_variants
      ? (row.price_variants as { label: string; price: number }[])
      : undefined,
  };
}
