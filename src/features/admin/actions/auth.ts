'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { auth } from '@/lib/auth';

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

  const result = await auth.login(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    return { ok: false, code: result.code, error: result.message };
  }

  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  await auth.logout();
  redirect('/login');
}
