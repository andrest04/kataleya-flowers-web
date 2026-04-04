import { createClient } from '@/lib/supabase/server';

function getSinceDate(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export async function getProductIdsWithViewsInRange(days: number): Promise<Set<string>> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_product_ids_with_views', {
    p_since: getSinceDate(days),
  });

  if (error) throw new Error(error.message);

  return new Set((data ?? []).map((row) => row.entity_id));
}

export async function getCategoryIdsWithActiveProducts(): Promise<Set<string>> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_active_category_ids');

  if (error) throw new Error(error.message);

  return new Set((data ?? []).map((row) => row.category_id));
}
