'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { loginAction } from '@/features/admin/actions/auth';
import { BUSINESS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

// Determined once at server render; `NEXT_PUBLIC_BACKEND` exposes the same
// `BACKEND` env var to the client bundle so the login page can skip the
// server-action call when Supabase is active. When `NEXT_PUBLIC_BACKEND` is
// unset the value is `undefined`, which is treated as `supabase`.
const isAppwriteBackend =
  process.env.NEXT_PUBLIC_BACKEND === 'appwrite';

/**
 * Isolated child that reads useSearchParams().
 * Must be wrapped in <Suspense> in the parent to avoid opting the page out of
 * static prerendering in Next.js App Router.
 */
function ForbiddenBanner({ error }: { error: string | null }) {
  const searchParams = useSearchParams();
  const message =
    searchParams.get('error') === 'forbidden'
      ? 'Tu usuario no tiene permisos de administrador.'
      : null;

  const display = error ?? message;
  if (!display) return null;

  return (
    <p className="text-sm" style={{ color: 'var(--color-primary)' }}>
      {display}
    </p>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isAppwriteBackend) {
      // Appwrite path: server action creates the session cookie server-side.
      const result = await loginAction({ email, password });
      if (!result.ok) {
        // Never render raw sentinel strings or internal codes. Map to a
        // user-safe message; VALIDATION and INVALID_CREDENTIALS already carry
        // one; anything else gets a generic fallback.
        const safeError =
          result.code === 'VALIDATION' || result.code === 'INVALID_CREDENTIALS'
            ? result.error
            : 'No se pudo iniciar sesión. Intenta de nuevo.';
        setError(safeError);
        setLoading(false);
        return;
      }
      router.push('/admin');
      router.refresh();
      return;
    }

    // Supabase path (default): unchanged client-side SDK flow.
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Credenciales incorrectas. Intentá de nuevo.');
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--color-cream)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1
            className="font-serif text-3xl"
            style={{ color: 'var(--color-primary)' }}
          >
            {BUSINESS.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Panel de administración
          </p>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-5 p-8 rounded-2xl"
          style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-dark)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-shadow focus:ring-2"
              style={{
                border: '1px solid var(--color-border)',
                background: 'var(--color-cream)',
                color: 'var(--color-dark)',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-dark)' }}
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-shadow focus:ring-2"
              style={{
                border: '1px solid var(--color-border)',
                background: 'var(--color-cream)',
                color: 'var(--color-dark)',
              }}
            />
          </div>

          <Suspense fallback={null}>
            <ForbiddenBanner error={error} />
          </Suspense>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            style={{ background: 'var(--color-primary)', color: 'var(--color-white)' }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  );
}
