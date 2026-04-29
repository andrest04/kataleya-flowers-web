'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('No pudimos cerrar la sesión completamente. Intentá de nuevo.');
        return;
      }
      router.push('/login');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={loading}
      className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ color: 'var(--color-muted)' }}
    >
      {loading ? 'Cerrando sesión…' : 'Cerrar sesión'}
    </button>
  );
}
