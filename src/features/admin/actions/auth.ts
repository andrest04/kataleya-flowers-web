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

const loginInputSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

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

export async function logoutAction(): Promise<void> {
  const sessionSecret = await getSessionCookie();
  if (sessionSecret) {
    try {
      const { account } = createSessionClient(sessionSecret);
      await account.deleteSession({ sessionId: 'current' });
    } catch (err) {
      console.error('[auth/logout] appwrite session delete error:', err);
    }
  }

  await deleteSessionCookie();
  redirect('/login');
}
