import { cookies } from 'next/headers';

export const APPWRITE_SESSION_COOKIE = 'a_session';

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
} as const;

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

export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(APPWRITE_SESSION_COOKIE);
}

export async function getSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(APPWRITE_SESSION_COOKIE)?.value ?? null;
}
