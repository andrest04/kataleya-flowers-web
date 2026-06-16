'use client';

import { useState } from 'react';

import { logoutAction } from '@/features/admin/actions/auth';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);

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
