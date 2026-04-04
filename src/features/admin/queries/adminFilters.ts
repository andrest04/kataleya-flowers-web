import { createClient } from '@/lib/supabase/server';

function getSinceDate(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export async function getProductIdsWithViewsInRange(days: number): Promise<Set<string>> {
  const supabase = await createClient();
  const since = getSinceDate(days);

  const { data, error } = await supabase
    .from('analytics_events')
    .select('entity_id')
    .eq('event_type', 'product_view')
    .gte('created_at', since);

  if (error) throw new Error(error.message);

  return new Set(
    (data ?? [])
      .map((event) => event.entity_id)
      .filter((entityId): entityId is string => entityId !== null),
  );
}

export async function getCategoryIdsWithActiveProducts(): Promise<Set<string>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('category_id')
    .eq('is_active', true);

  if (error) throw new Error(error.message);

  return new Set((data ?? []).map((product) => product.category_id));
}
