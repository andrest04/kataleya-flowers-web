import {
  type FlowerTypeRepoRow,
  getFlowerTypeUsage as getFlowerTypeUsageAppwrite,
  listFlowerTypes,
} from '@/lib/appwrite/repositories/taxonomy';
import type { Database } from '@/lib/supabase/types';

export type FlowerTypeRow = Database['public']['Tables']['flower_types']['Row'];
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
