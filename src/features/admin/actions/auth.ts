'use server';

import { checkBotId } from 'botid/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import type { RateLimitPolicy } from '@/lib/rateLimit';
import { clientKeyFromHeaders, rateLimiter } from '@/lib/rateLimit';

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
  code?: 'VALIDATION' | 'INVALID_CREDENTIALS' | 'FORBIDDEN' | 'RATE_LIMITED' | 'INTERNAL';
}

export type LoginResult = LoginSuccess | LoginFailure;

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_EMAIL_POLICY: RateLimitPolicy = { limit: 5, windowMs: LOGIN_WINDOW_MS };
const LOGIN_IP_POLICY: RateLimitPolicy = { limit: 20, windowMs: LOGIN_WINDOW_MS };

const INTERNAL_FAILURE: LoginFailure = {
  ok: false,
  code: 'INTERNAL',
  error: 'No se pudo iniciar sesión. Intenta de nuevo.',
};

const RATE_LIMITED_FAILURE: LoginFailure = {
  ok: false,
  code: 'RATE_LIMITED',
  error: 'Demasiados intentos de inicio de sesión. Espera unos minutos e intenta de nuevo.',
};

async function isLoginAllowed(email: string): Promise<boolean> {
  const ip = await rateLimiter.hit('login-ip', clientKeyFromHeaders(await headers()), LOGIN_IP_POLICY);
  if (!ip.allowed) return false;
  const account = await rateLimiter.hit('login-email', email.toLowerCase(), LOGIN_EMAIL_POLICY);
  return account.allowed;
}

export async function loginAction(input: LoginInput): Promise<LoginResult> {
  const { isBot } = await checkBotId();
  if (isBot) return INTERNAL_FAILURE;

  const parsed = loginInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION',
      error: parsed.error.issues[0]?.message ?? 'Datos de inicio de sesión inválidos.',
    };
  }

  try {
    if (!(await isLoginAllowed(parsed.data.email))) return RATE_LIMITED_FAILURE;
  } catch (error) {
    console.error('[auth] login rate limiter unavailable, refusing login:', error);
    return INTERNAL_FAILURE;
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

export async function clearStaleSessionAction(): Promise<void> {
  await auth.clearSession();
}
