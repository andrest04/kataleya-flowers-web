// Server-only: reads/writes the `a_session` cookie via next/headers.
import { cookies } from 'next/headers';

/** Name of the Appwrite session cookie. */
export const APPWRITE_SESSION_COOKIE = 'a_session';

/**
 * Base attributes for the Appwrite session cookie. `httpOnly` keeps the session
 * secret out of client JS, `sameSite=lax` matches the admin redirect flow, and
 * `secure` is enabled outside development.
 */
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
} as const;

/**
 * Persists the Appwrite session secret in the `a_session` cookie.
 * `expiresAt` is the Appwrite session expiry (ISO string) used to scope the
 * cookie lifetime to the server-side session.
 */
export async function setSessionCookie(
  secret: string,
  expiresAt: string,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(APPWRITE_SESSION_COOKIE, secret, {
    ...SESSION_COOKIE_OPTIONS,
    expires: new Date(expiresAt),
  });
}

/** Clears the `a_session` cookie (logout / invalid session). */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(APPWRITE_SESSION_COOKIE);
}

/** Reads the raw session secret from the `a_session` cookie, or null. */
export async function getSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(APPWRITE_SESSION_COOKIE)?.value ?? null;
}
