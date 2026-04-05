import { createStaticClient } from '@/lib/supabase/static';

export async function getFlowerTypes(): Promise<{ name: string }[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('flower_types')
    .select('name, display_order')
    .order('display_order', { ascending: true });

  if (error) throw new Error(`getFlowerTypes failed: ${error.message}`);
  return data ?? [];
}
