// Server-only: this module must never be imported into client code — the
// Appwrite API key would otherwise be bundled into the browser.
import { Account, Client, Databases, Storage, Teams, Users } from 'node-appwrite';

import { getAppwriteConfig } from '@/lib/appwrite/config';

/**
 * Admin (API-key) Appwrite client. Server-only — the API key MUST never be
 * bundled into client code. Used for privileged operations: anon complaint
 * inserts, the atomic correlativo counter, all admin writes, and team
 * membership checks.
 */
export function createAdminClient() {
  const config = getAppwriteConfig();

  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(config.apiKey);

  return {
    databases: new Databases(client),
    users: new Users(client),
    teams: new Teams(client),
    account: new Account(client),
    storage: new Storage(client),
  };
}

export type AdminClient = ReturnType<typeof createAdminClient>;
