import { requireAdmin } from '@/features/admin/utils/auth';
import type { Category } from '@/lib/database/repositories/categories';
import { categoryRepository } from '@/lib/database/repositories/categories';

export type { Category };

export async function getAdminCategories(): Promise<Category[]> {
  await requireAdmin();
  return categoryRepository.listAll();
}

export async function getAdminCategoryById(id: string): Promise<Category | null> {
  await requireAdmin();
  return categoryRepository.findById(id);
}
