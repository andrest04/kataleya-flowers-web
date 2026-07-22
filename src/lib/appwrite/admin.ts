import { Account, Client, Databases, Storage, Teams, Users } from 'node-appwrite';

import { getAppwriteConfig } from '@/lib/appwrite/config';

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
