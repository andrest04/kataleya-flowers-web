import {
  APPWRITE_BUCKETS,
  APPWRITE_COLLECTIONS,
  APPWRITE_DATABASE_ID,
  APPWRITE_TEAM_ADMINS_ID,
  type AppwriteBucketIds,
  type AppwriteCollectionIds,
} from './ids';

export {
  APPWRITE_BUCKETS,
  APPWRITE_COLLECTIONS,
  APPWRITE_DATABASE_ID,
  APPWRITE_TEAM_ADMINS_ID,
  type AppwriteBucketIds,
  type AppwriteCollectionIds,
} from './ids';

export interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  apiKey: string;
  databaseId: string;
  teamAdminsId: string;
  collections: AppwriteCollectionIds;
  buckets: AppwriteBucketIds;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing Appwrite environment variable: ${name} is required.`);
  }
  return value;
}

export function getAppwriteConfig(): AppwriteConfig {
  return {
    endpoint: requireEnv('APPWRITE_ENDPOINT'),
    projectId: requireEnv('APPWRITE_PROJECT_ID'),
    apiKey: requireEnv('APPWRITE_API_KEY'),
    databaseId: APPWRITE_DATABASE_ID,
    teamAdminsId: APPWRITE_TEAM_ADMINS_ID,
    collections: APPWRITE_COLLECTIONS,
    buckets: APPWRITE_BUCKETS,
  };
}
