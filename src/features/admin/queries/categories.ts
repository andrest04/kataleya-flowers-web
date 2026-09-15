import type { Category } from '@/lib/database/repositories/categories';
import { categoryRepository } from '@/lib/database/repositories/categories';

export type { Category };

export async function getAdminCategories(): Promise<Category[]> {
  return categoryRepository.listAll();
}

export async function getAdminCategoryById(id: string): Promise<Category | null> {
  return categoryRepository.findById(id);
}
