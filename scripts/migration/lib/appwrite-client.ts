/**
 * Appwrite admin client for offline migration scripts.
 *
 * Wraps `createAdminClient` from the app library so the same env-var contract
 * (APPWRITE_ENDPOINT / APPWRITE_PROJECT_ID / APPWRITE_API_KEY) is reused.
 * Never imported by Next.js — scripts/migration only.
 */

import { createAdminClient } from '../../../src/lib/appwrite/admin';

export { createAdminClient };

/** Convenience re-export so scripts can do a single import. */
export {
  APPWRITE_COLLECTIONS,
  APPWRITE_DATABASE_ID,
  APPWRITE_TEAM_ADMINS_ID,
  getAppwriteConfig,
} from '../../../src/lib/appwrite/config';
