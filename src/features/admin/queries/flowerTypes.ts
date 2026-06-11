import { isAppwriteBackend } from '@/lib/appwrite/config';
import {
  type FlowerTypeRepoRow,
  getFlowerTypeUsage as getFlowerTypeUsageAppwrite,
  listFlowerTypes,
} from '@/lib/appwrite/repositories/taxonomy';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

export type FlowerTypeRow = Database['public']['Tables']['flower_types']['Row'];
export type { FlowerTypeRepoRow };

export async function getFlowerTypes(): Promise<FlowerTypeRow[] | FlowerTypeRepoRow[]> {
  if (isAppwriteBackend()) {
    return listFlowerTypes();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('flower_types')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw new Error(`getFlowerTypes failed: ${error.message}`);
  return data ?? [];
}

/**
 * Returns the list of products that use a given flower type (by name).
 * Counts via junction table — does NOT use the old array-based RPC.
 */
export async function getFlowerTypeUsage(
  name: string
): Promise<{ product_id: string; product_name: string }[]> {
  if (isAppwriteBackend()) {
    return getFlowerTypeUsageAppwrite(name);
  }

  const supabase = await createClient();

  // Resolve flower type name → id first
  const { data: ft, error: ftError } = await supabase
    .from('flower_types')
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (ftError) throw new Error(`getFlowerTypeUsage (resolve id) failed: ${ftError.message}`);
  if (!ft) return [];

  const { data, error } = await supabase
    .from('product_flower_type_assignments')
    .select('product_id, products(id, name)')
    .eq('flower_type_id', ft.id);

  if (error) throw new Error(`getFlowerTypeUsage failed: ${error.message}`);

  return (data ?? []).flatMap((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    if (!product || typeof product !== 'object') return [];
    const p = product as { id: string; name: string };
    return [{ product_id: p.id, product_name: p.name }];
  });
}
