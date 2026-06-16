import {
  type ColorRepoRow,
  getColorUsage,
  listColors,
} from '@/lib/appwrite/repositories/taxonomy';
import type { Database } from '@/lib/supabase/types';

export type ProductColorRow = Database['public']['Tables']['product_colors']['Row'];
export type { ColorRepoRow };

export async function getProductColors(): Promise<ColorRepoRow[]> {
  return listColors();
}

/**
 * Returns the list of products that use a given color (by name).
 * Counts via junction table — does NOT use the old array-based RPC.
 */
export async function getProductColorUsage(
  name: string
): Promise<{ product_id: string; product_name: string }[]> {
  return getColorUsage(name);
}
