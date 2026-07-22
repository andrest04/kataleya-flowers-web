'use client';

import { useState } from 'react';

import { logoutAction } from '@/features/admin/actions/auth';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);

    try {
      await logoutAction();
    } catch (error) {
      void error;
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
