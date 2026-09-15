import { cookies } from 'next/headers';

import { SESSION_COOKIE_NAME } from './sessionCookie';
import type { AuthSession, SessionStore } from './types';

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
} as const;

class CookieSessionStore implements SessionStore {
  async get(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
  }

  async set(session: AuthSession): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, session.secret, {
      ...SESSION_COOKIE_OPTIONS,
      expires: new Date(session.expiresAt),
    });
  }

  async delete(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

export const cookieSessionStore: SessionStore = new CookieSessionStore();
