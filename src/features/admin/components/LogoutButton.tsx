'use client';

import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
      toast.error('No se pudo cerrar sesión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={loading}
      aria-label={loading ? 'Cerrando sesión' : 'Cerrar sesión'}
      className="flex min-w-16 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs transition-colors hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) disabled:cursor-not-allowed disabled:opacity-60 md:min-w-0 md:w-full md:flex-none md:flex-row md:justify-start md:gap-2 md:px-3 md:py-2 md:text-sm"
      style={{ color: 'var(--color-muted)' }}
    >
      <LogOut className="size-4 shrink-0" aria-hidden="true" strokeWidth={1.8} />
      <span className="hidden md:inline" role="status" aria-live="polite">
        {loading ? 'Cerrando sesión…' : 'Cerrar sesión'}
      </span>
    </button>
  );
}
