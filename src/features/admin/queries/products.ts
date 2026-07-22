import {
  type AdminProductAppwriteRow,
  findAdminProductById,
  listAdminProducts,
} from '@/lib/appwrite/repositories/products';
import type { ProductRow } from '@/lib/db/rows';

export type { ProductRow };

export type AdminProductRow = ProductRow & {
  product_color_assignments:
    | { color_id: string; product_colors: { id: string; name: string; hex: string | null; label: string } | null }[]
    | null;
  product_flower_type_assignments:
    | { flower_type_id: string; flower_types: { id: string; name: string } | null }[]
    | null;
  product_images:
    | {
        id: string;
        url: string;
        alt_text: string | null;
        is_primary: boolean;
        display_order: number;
      }[]
    | null;
};

export type { AdminProductAppwriteRow };

export async function getAdminProducts(): Promise<AdminProductRow[]> {
  return listAdminProducts() as unknown as AdminProductRow[];
}

export async function getAdminProductById(id: string): Promise<AdminProductRow | null> {
  const row = await findAdminProductById(id);
  return row as unknown as AdminProductRow | null;
}
