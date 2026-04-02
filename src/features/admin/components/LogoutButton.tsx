'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80"
      style={{ color: 'var(--color-muted)' }}
    >
      Cerrar sesión
    </button>
  );
}
