// Server-only: builds a session-scoped client from the user's session secret.
import { Account, Client, Databases } from 'node-appwrite';

import { getAppwriteConfig } from '@/lib/appwrite/config';

/**
 * Per-request session-scoped Appwrite client. Built from the user's session
 * secret (read from the `a_session` cookie) and acts as that authenticated
 * user — no API key. Create a fresh instance per request; never cache it.
 */
export function createSessionClient(sessionSecret: string) {
  const config = getAppwriteConfig();

  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setSession(sessionSecret);

  return {
    account: new Account(client),
    databases: new Databases(client),
  };
}

export type SessionClient = ReturnType<typeof createSessionClient>;
