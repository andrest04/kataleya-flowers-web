'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import {
  deleteSessionCookie,
  getSessionCookie,
  setSessionCookie,
} from '@/lib/appwrite/cookies';
import { authProvider } from '@/lib/auth';

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

  const result = await authProvider.login(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    return { ok: false, code: result.code, error: result.message };
  }

  await setSessionCookie(result.session.secret, result.session.expiresAt);
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  const sessionSecret = await getSessionCookie();
  if (sessionSecret) {
    await authProvider.logout(sessionSecret);
  }

  await deleteSessionCookie();
  redirect('/login');
}
