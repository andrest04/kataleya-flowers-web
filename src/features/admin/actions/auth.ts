'use server';

import { redirect } from 'next/navigation';
import { AppwriteException } from 'node-appwrite';
import { z } from 'zod';

import { createAdminClient } from '@/lib/appwrite/admin';
import { isAppwriteBackend } from '@/lib/appwrite/config';
import {
  deleteSessionCookie,
  getSessionCookie,
  setSessionCookie,
} from '@/lib/appwrite/cookies';
import { createSessionClient } from '@/lib/appwrite/session';

// ─── Schema ───────────────────────────────────────────────────────────────────

/**
 * Validates login input. Password min(1) only — we must not lock out existing
 * users whose passwords may be shorter than an enforcement threshold. Appwrite
 * rejects invalid credentials with a 401; that is the authoritative check.
 */
export const loginInputSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginInputSchema>;

export interface LoginSuccess {
  ok: true;
}

export interface LoginFailure {
  ok: false;
  error: string;
  code?: 'VALIDATION' | 'INVALID_CREDENTIALS' | 'BACKEND_MISMATCH' | 'INTERNAL';
}

export type LoginResult = LoginSuccess | LoginFailure;

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Login server action (Appwrite path).
 *
 * Creates an Appwrite email/password session and stores the session secret in
 * the `a_session` httpOnly cookie. Requires the admin client (API key via
 * X-Appwrite-Key) so Appwrite includes `session.secret` in the response —
 * without the API key the secret field is always an empty string.
 *
 * Only called when `BACKEND=appwrite`; the Supabase login path remains the
 * client-side Supabase SDK (unchanged).
 */
async function loginAppwrite(input: LoginInput): Promise<LoginResult> {
  try {
    const { account } = createAdminClient();
    const session = await account.createEmailPasswordSession({
      email: input.email,
      password: input.password,
    });
    await setSessionCookie(session.secret, session.expire);
    return { ok: true };
  } catch (err) {
    if (err instanceof AppwriteException) {
      // 401 = invalid credentials; do not leak internal details
      if (err.code === 401) {
        return {
          ok: false,
          code: 'INVALID_CREDENTIALS',
          error: 'Credenciales incorrectas. Intenta de nuevo.',
        };
      }
    }
    console.error('[auth/login] appwrite error:', err);
    return {
      ok: false,
      code: 'INTERNAL',
      error: 'No se pudo iniciar sesión. Intenta de nuevo.',
    };
  }
}

/**
 * Dispatches to the active backend login path.
 *
 * - `BACKEND=appwrite` → Appwrite email/password session via server action.
 * - Otherwise → returns `{ ok: false, code: 'BACKEND_MISMATCH' }` because
 *   Supabase login is client-side and must never call this server action.
 *   A mismatch (BACKEND=supabase but action called) is always a configuration
 *   error: NEXT_PUBLIC_BACKEND and BACKEND must be identical at cutover.
 */
export async function loginAction(input: LoginInput): Promise<LoginResult> {
  // Validate input before dispatching to either backend.
  const parsed = loginInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION',
      error: parsed.error.issues[0]?.message ?? 'Datos de inicio de sesión inválidos.',
    };
  }

  if (isAppwriteBackend()) {
    return loginAppwrite(parsed.data);
  }

  // Split-brain guard: NEXT_PUBLIC_BACKEND=appwrite on the client but
  // BACKEND≠appwrite on the server. This is always a deployment misconfiguration.
  console.error(
    '[auth/login] BACKEND_MISMATCH: loginAction called but BACKEND is not "appwrite". ' +
      'Both BACKEND and NEXT_PUBLIC_BACKEND must be set to the same value at cutover. ' +
      `Current BACKEND="${process.env.BACKEND ?? '(unset)'}"`,
  );
  return {
    ok: false,
    code: 'BACKEND_MISMATCH',
    error: 'Error de configuración del servidor. Contacta al administrador.',
  };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Logout server action (Appwrite path).
 *
 * Deletes the current Appwrite session server-side and clears the `a_session`
 * cookie. Redirects to `/login` after cleanup. Errors from the remote session
 * delete are swallowed so the cookie is always cleared (expired sessions still
 * clean up the cookie).
 *
 * Only called when `BACKEND=appwrite`; the Supabase logout stays the existing
 * client-side `supabase.auth.signOut()` in LogoutButton.
 */
export async function logoutAction(): Promise<void> {
  if (!isAppwriteBackend()) {
    // Guard: Supabase logout is client-side — do nothing.
    redirect('/login');
  }

  const sessionSecret = await getSessionCookie();
  if (sessionSecret) {
    try {
      const { account } = createSessionClient(sessionSecret);
      await account.deleteSession({ sessionId: 'current' });
    } catch (err) {
      // Log but do not re-throw — the cookie is cleared regardless so the
      // local session is always invalidated even if the remote call fails.
      console.error('[auth/logout] appwrite session delete error:', err);
    }
  }

  await deleteSessionCookie();
  redirect('/login');
}
