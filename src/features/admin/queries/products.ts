import {
  type AdminProductListPage,
  type AdminProductListRow,
  type Product,
  productsRepository,
} from '@/lib/database/repositories/products';

export type { AdminProductListPage, AdminProductListRow, Product };

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
  return productsRepository.listAdminCategoryCounts(categoryIds, gallery);
}

export async function getAdminProductList({
  page,
  categoryId,
  search,
  status,
  gallery,
}: AdminProductListParams): Promise<AdminProductListPage> {
  return productsRepository.listAdminPage({
    page,
    pageSize: ADMIN_PRODUCT_PAGE_SIZE,
    categoryId,
    search,
    status,
    gallery,
  });
}

export async function getAdminProductById(id: string): Promise<Product | null> {
  return productsRepository.findAdminById(id);
}
