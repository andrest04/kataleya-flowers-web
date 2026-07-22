import {
  type ColorRepoRow,
  getColorUsage,
  listColors,
} from '@/lib/appwrite/repositories/taxonomy';
import type { ProductColorRow } from '@/lib/db/rows';

export type { ProductColorRow };
export type { ColorRepoRow };

export async function getProductColors(): Promise<ColorRepoRow[]> {
  return listColors();
}

export async function getProductColorUsage(
  name: string
): Promise<{ product_id: string; product_name: string }[]> {
  return getColorUsage(name);
}
