import { isAppwriteBackend } from '@/lib/appwrite/config';
import { listColors } from '@/lib/appwrite/repositories/taxonomy';
import { createStaticClient } from '@/lib/supabase/static';

export async function getProductColors(): Promise<{ name: string; label: string; hex: string | null }[]> {
  if (isAppwriteBackend()) {
    const rows = await listColors();
    return rows.map(({ name, label, hex }) => ({ name, label, hex }));
  }

  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('product_colors')
    .select('name, label, hex, display_order')
    .order('display_order', { ascending: true });

  if (error) throw new Error(`getProductColors failed: ${error.message}`);
  return data ?? [];
}
