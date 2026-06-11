'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { logoutAction } from '@/features/admin/actions/auth';
import { createClient } from '@/lib/supabase/client';

// Determined once at bundle time via the NEXT_PUBLIC_BACKEND env var so the
// correct logout path is selected without a server round-trip.
const isAppwriteBackend =
  process.env.NEXT_PUBLIC_BACKEND === 'appwrite';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);

    if (isAppwriteBackend) {
      // Appwrite path: server action deletes the session and clears the cookie,
      // then redirects to /login via `redirect()` in the action.
      try {
        await logoutAction();
      } catch {
        // `redirect()` throws internally — this is expected Next.js behaviour.
        // No toast needed: the page will navigate to /login.
      } finally {
        setLoading(false);
      }
      return;
    }

    // Supabase path (default): unchanged client-side SDK flow.
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
