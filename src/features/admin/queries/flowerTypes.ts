import { type FlowerTypeRepoRow, taxonomyRepository } from '@/lib/database/repositories/taxonomy';
import type { FlowerTypeRow } from '@/lib/db/rows';

export type { FlowerTypeRow };
export type { FlowerTypeRepoRow };

export async function getFlowerTypes(): Promise<FlowerTypeRepoRow[]> {
  return taxonomyRepository.listFlowerTypes();
}

export async function getFlowerTypeUsage(
  name: string
): Promise<{ product_id: string; product_name: string }[]> {
  return taxonomyRepository.getFlowerTypeUsage(name);
}
