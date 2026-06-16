import {
  type FlowerTypeRepoRow,
  getFlowerTypeUsage as getFlowerTypeUsageAppwrite,
  listFlowerTypes,
} from '@/lib/appwrite/repositories/taxonomy';
import type { FlowerTypeRow } from '@/lib/db/rows';

export type { FlowerTypeRow };
export type { FlowerTypeRepoRow };

export async function getFlowerTypes(): Promise<FlowerTypeRepoRow[]> {
  return listFlowerTypes();
}

/**
 * Returns the list of products that use a given flower type (by name).
 * Counts via junction table — does NOT use the old array-based RPC.
 */
export async function getFlowerTypeUsage(
  name: string
): Promise<{ product_id: string; product_name: string }[]> {
  return getFlowerTypeUsageAppwrite(name);
}
