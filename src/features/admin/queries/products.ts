import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

export type ProductRow = Database['public']['Tables']['products']['Row'];

/** ProductRow augmented with relational taxonomy — used by admin edit form */
export type AdminProductRow = ProductRow & {
  product_color_assignments:
    | { color_id: string; product_colors: { id: string; name: string; hex: string | null; label: string } | null }[]
    | null;
  product_flower_type_assignments:
    | { flower_type_id: string; flower_types: { id: string; name: string } | null }[]
    | null;
  product_images:
    | {
        id: string;
        url: string;
        alt_text: string | null;
        is_primary: boolean;
        display_order: number;
      }[]
    | null;
};

const ADMIN_PRODUCT_SELECT = `
  *,
  product_color_assignments(color_id, product_colors(id, name, hex, label)),
  product_flower_type_assignments(flower_type_id, flower_types(id, name)),
  product_images(id, url, alt_text, is_primary, display_order)
` as const;

export async function getAdminProducts(): Promise<AdminProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(ADMIN_PRODUCT_SELECT)
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AdminProductRow[];
}

export async function getAdminProductById(id: string): Promise<AdminProductRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(ADMIN_PRODUCT_SELECT)
    .eq('id', id)
    .single();

  if (error) return null;
  return data as unknown as AdminProductRow;
}
