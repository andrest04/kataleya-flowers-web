import 'server-only';

import { Account, Client } from 'node-appwrite';

import { getAppwriteConfig } from '@/lib/appwrite/config';

export function createSessionClient(sessionSecret: string) {
  const config = getAppwriteConfig();

  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setSession(sessionSecret);

  return {
    account: new Account(client),
  };
}

export type SessionClient = ReturnType<typeof createSessionClient>;
