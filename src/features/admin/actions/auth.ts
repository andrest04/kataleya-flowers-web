'use server';

import { checkBotId } from 'botid/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { z } from 'zod';

import { strongPasswordSchema } from '@/features/admin/schemas/passwordStrength';
import { auth } from '@/lib/auth';
import { buildRecoveryUrl } from '@/lib/auth/recoveryUrl';
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

const HOUR_MS = 60 * 60 * 1000;
const RECOVERY_IP_POLICY: RateLimitPolicy = { limit: 10, windowMs: HOUR_MS };
const RECOVERY_EMAIL_POLICY: RateLimitPolicy = { limit: 3, windowMs: HOUR_MS };
const RESET_IP_POLICY: RateLimitPolicy = { limit: 10, windowMs: LOGIN_WINDOW_MS };

const APPWRITE_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,35}$/;
const MAX_RECOVERY_SECRET_LENGTH = 2048;

const recoveryRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, 'Escribe un email válido, por ejemplo nombre@dominio.com.')
    .email('Escribe un email válido, por ejemplo nombre@dominio.com.'),
});

const recoveryLinkSchema = z.object({
  userId: z.string().regex(APPWRITE_ID_PATTERN),
  secret: z.string().min(1).max(MAX_RECOVERY_SECRET_LENGTH),
});

const newPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden. Escribe la misma en ambos campos.',
  });

export interface PasswordRecoveryRequestInput {
  email: string;
}

export type PasswordRecoveryRequestResult =
  | { ok: true }
  | { ok: false; code: 'VALIDATION'; error: string; fieldErrors: { email?: string } }
  | { ok: false; code: 'RATE_LIMITED' | 'INTERNAL'; error: string };

export interface ResetPasswordInput {
  userId: string;
  secret: string;
  password: string;
  confirmPassword: string;
}

export type ResetPasswordField = 'password' | 'confirmPassword';

export type ResetPasswordResult =
  | { ok: true }
  | {
      ok: false;
      code: 'VALIDATION';
      error: string;
      fieldErrors: Partial<Record<ResetPasswordField, string>>;
    }
  | {
      ok: false;
      code: 'INVALID_LINK' | 'WEAK_PASSWORD' | 'RATE_LIMITED' | 'INTERNAL';
      error: string;
    };

const RECOVERY_INTERNAL_FAILURE = {
  ok: false,
  code: 'INTERNAL',
  error: 'No se pudo procesar la solicitud. Intenta de nuevo.',
} as const;

const RECOVERY_RATE_LIMITED_FAILURE = {
  ok: false,
  code: 'RATE_LIMITED',
  error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
} as const;

const RESET_INVALID_LINK_FAILURE = {
  ok: false,
  code: 'INVALID_LINK',
  error: 'El enlace no es válido o ya venció. Solicita uno nuevo.',
} as const;

async function isRecoveryRequestAllowed(email: string): Promise<boolean> {
  const ip = await rateLimiter.hit(
    'recovery-ip',
    clientKeyFromHeaders(await headers()),
    RECOVERY_IP_POLICY,
  );
  if (!ip.allowed) return false;
  const account = await rateLimiter.hit('recovery-email', email, RECOVERY_EMAIL_POLICY);
  return account.allowed;
}

async function sendRecoveryInBackground(email: string): Promise<void> {
  try {
    await auth.requestPasswordRecovery(email, buildRecoveryUrl());
  } catch (error) {
    console.error('[auth] password recovery task failed:', error instanceof Error ? error.name : 'unknown');
  }
}

export async function requestPasswordRecoveryAction(
  input: PasswordRecoveryRequestInput,
): Promise<PasswordRecoveryRequestResult> {
  const { isBot } = await checkBotId();
  if (isBot) return RECOVERY_INTERNAL_FAILURE;

  const parsed = recoveryRequestSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Escribe un email válido.';
    return { ok: false, code: 'VALIDATION', error: message, fieldErrors: { email: message } };
  }

  const { email } = parsed.data;
  try {
    if (!(await isRecoveryRequestAllowed(email))) return RECOVERY_RATE_LIMITED_FAILURE;
  } catch (error) {
    console.error('[auth] recovery rate limiter unavailable, refusing request:', error);
    return RECOVERY_INTERNAL_FAILURE;
  }

  after(() => sendRecoveryInBackground(email));
  return { ok: true };
}

function passwordFieldErrors(issues: z.core.$ZodIssue[]): Partial<Record<ResetPasswordField, string>> {
  const fieldErrors: Partial<Record<ResetPasswordField, string>> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if ((field === 'password' || field === 'confirmPassword') && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

export async function resetPasswordAction(input: ResetPasswordInput): Promise<ResetPasswordResult> {
  const { isBot } = await checkBotId();
  if (isBot) return RECOVERY_INTERNAL_FAILURE;

  const link = recoveryLinkSchema.safeParse({ userId: input.userId, secret: input.secret });
  if (!link.success) return RESET_INVALID_LINK_FAILURE;

  const passwords = newPasswordSchema.safeParse({
    password: input.password,
    confirmPassword: input.confirmPassword,
  });
  if (!passwords.success) {
    const fieldErrors = passwordFieldErrors(passwords.error.issues);
    const count = Object.keys(fieldErrors).length;
    return {
      ok: false,
      code: 'VALIDATION',
      error: count > 1 ? `Revisa los ${count} campos marcados.` : 'Revisa el campo marcado.',
      fieldErrors,
    };
  }

  try {
    const decision = await rateLimiter.hit(
      'reset-ip',
      clientKeyFromHeaders(await headers()),
      RESET_IP_POLICY,
    );
    if (!decision.allowed) {
      return {
        ok: false,
        code: 'RATE_LIMITED',
        error: 'Demasiados intentos. Espera unos minutos e intenta de nuevo.',
      };
    }
  } catch (error) {
    console.error('[auth] reset rate limiter unavailable, refusing reset:', error);
    return RECOVERY_INTERNAL_FAILURE;
  }

  const result = await auth.completePasswordRecovery(
    link.data.userId,
    link.data.secret,
    passwords.data.password,
  );
  if (!result.ok) return { ok: false, code: result.code, error: result.message };
  return { ok: true };
}
