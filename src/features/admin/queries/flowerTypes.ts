import { requireAdmin } from '@/features/admin/utils/auth';
import { type FlowerTypeRepoRow, taxonomyRepository } from '@/lib/database/repositories/taxonomy';
import type { FlowerTypeRow } from '@/lib/db/rows';

export type { FlowerTypeRow };
export type { FlowerTypeRepoRow };

export async function getFlowerTypes(): Promise<FlowerTypeRepoRow[]> {
  await requireAdmin();
  return taxonomyRepository.listFlowerTypes();
}

export async function getFlowerTypeUsage(
  name: string
): Promise<{ product_id: string; product_name: string }[]> {
  await requireAdmin();
  return taxonomyRepository.getFlowerTypeUsage(name);
}
