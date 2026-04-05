import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

export type FlowerTypeRow = Database['public']['Tables']['flower_types']['Row'];

export async function getFlowerTypes(): Promise<FlowerTypeRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('flower_types')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw new Error(`getFlowerTypes failed: ${error.message}`);
  return data ?? [];
}

export async function getFlowerTypeUsage(
  name: string
): Promise<{ product_id: string; product_name: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_flower_type_usage', {
    p_name: name,
  });

  if (error) throw new Error(`getFlowerTypeUsage failed: ${error.message}`);
  return data ?? [];
}
