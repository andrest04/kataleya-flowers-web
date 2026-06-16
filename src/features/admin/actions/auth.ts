'use server';

import { redirect } from 'next/navigation';
import { AppwriteException } from 'node-appwrite';
import { z } from 'zod';

import { createAdminClient } from '@/lib/appwrite/admin';
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
// Not exported: a "use server" file may only export async functions. This
// schema is internal to loginAction (Next.js rejects non-function exports here).
const loginInputSchema = z.object({
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
  code?: 'VALIDATION' | 'INVALID_CREDENTIALS' | 'INTERNAL';
}

export type LoginResult = LoginSuccess | LoginFailure;

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Login server action.
 *
 * Creates an Appwrite email/password session and stores the session secret in
 * the `a_session` httpOnly cookie. Requires the admin client (API key via
 * X-Appwrite-Key) so Appwrite includes `session.secret` in the response —
 * without the API key the secret field is always an empty string.
 */
export async function loginAction(input: LoginInput): Promise<LoginResult> {
  const parsed = loginInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION',
      error: parsed.error.issues[0]?.message ?? 'Datos de inicio de sesión inválidos.',
    };
  }

  try {
    const { account } = createAdminClient();
    const session = await account.createEmailPasswordSession({
      email: parsed.data.email,
      password: parsed.data.password,
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

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Logout server action.
 *
 * Deletes the current Appwrite session server-side and clears the `a_session`
 * cookie. Redirects to `/login` after cleanup. Errors from the remote session
 * delete are swallowed so the cookie is always cleared (expired sessions still
 * clean up the cookie).
 */
export async function logoutAction(): Promise<void> {
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
