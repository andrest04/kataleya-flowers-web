import {
  type AdminProductAppwriteRow,
  type AdminProductListPage,
  type AdminProductListRow,
  findAdminProductById,
  listAdminProductCategoryCounts,
  listAdminProductPage,
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

export type { AdminProductAppwriteRow, AdminProductListPage, AdminProductListRow };

export const ADMIN_PRODUCT_PAGE_SIZE = 25;

export interface AdminProductListParams {
  page: number;
  categoryId?: string;
  search?: string;
  status?: 'active' | 'inactive';
  gallery?: 'at-most-one-image';
}

export async function getAdminProductCategoryCounts(
  categoryIds: string[],
  gallery?: 'at-most-one-image',
): Promise<Record<string, number>> {
  return listAdminProductCategoryCounts(categoryIds, gallery);
}

export async function getAdminProductList({
  page,
  categoryId,
  search,
  status,
  gallery,
}: AdminProductListParams): Promise<AdminProductListPage> {
  return listAdminProductPage({
    page,
    pageSize: ADMIN_PRODUCT_PAGE_SIZE,
    categoryId,
    search,
    status,
    gallery,
  });
}

export async function getAdminProductById(id: string): Promise<AdminProductRow | null> {
  const row = await findAdminProductById(id);
  return row as unknown as AdminProductRow | null;
}
