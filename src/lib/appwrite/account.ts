// Server-only: resolves the current user from a session secret.
import type { Models } from 'node-appwrite';

import { createSessionClient } from '@/lib/appwrite/session';

/** Authenticated Appwrite user (account document). */
export type AppwriteUser = Models.User<Models.Preferences>;

/**
 * Resolves the current user from a session secret. Returns null when the
 * session is missing, expired, or otherwise invalid — callers MUST treat null
 * as "unauthenticated" and redirect/deny accordingly. Never throws on an
 * invalid session, so it is safe to call from layouts and guards.
 */
export async function getUser(
  sessionSecret: string,
): Promise<AppwriteUser | null> {
  try {
    const { account } = createSessionClient(sessionSecret);
    return await account.get();
  } catch {
    return null;
  }
}
