import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/types';

type AdminCheckClient = Pick<SupabaseClient<Database>, 'from'>;

export async function isAdminUser(
  supabase: AdminCheckClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[admin-membership] failed to resolve admin membership:', {
      userId,
      error,
    });
    return false;
  }

  return Boolean(data);
}
