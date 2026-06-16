/**
 * Appwrite environment configuration and collection IDs.
 *
 * Appwrite is the sole backend. Env validation is lazy — importing this file
 * never throws; `getAppwriteConfig()` fails loudly only when a consumer actually
 * resolves the config and a required variable is missing.
 */

/**
 * Stable Appwrite resource IDs.
 *
 * These are deterministic, human-readable IDs chosen at provisioning time and
 * identical across every environment (the IaC snapshot reproduces them), so
 * they are code constants — the same contract as Supabase's `.from('products')`
 * table names. Only endpoint, project ID, and API key vary per environment.
 */
export const APPWRITE_DATABASE_ID = 'kataleya';
export const APPWRITE_TEAM_ADMINS_ID = 'admins';

export const APPWRITE_COLLECTIONS = {
  products: 'products',
  categories: 'categories',
  productImages: 'product_images',
  colors: 'colors',
  flowerTypes: 'flower_types',
  colorAssignments: 'color_assignments',
  flowerTypeAssignments: 'flower_type_assignments',
  complaints: 'complaints',
  counters: 'counters',
} as const;

/** Names of the Appwrite collections used by Phase 1 (Auth + DB). */
export type AppwriteCollectionIds = typeof APPWRITE_COLLECTIONS;

/** Fully resolved, validated Appwrite configuration. */
export interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  apiKey: string;
  databaseId: string;
  teamAdminsId: string;
  collections: AppwriteCollectionIds;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing Appwrite environment variable: ${name} is required.`);
  }
  return value;
}

/**
 * Resolves and validates the full Appwrite configuration.
 *
 * Throws if any required variable is missing. Call this only from server-side
 * Appwrite code paths (admin/session clients, repositories) that run when
 * Appwrite is the selected backend.
 */
export function getAppwriteConfig(): AppwriteConfig {
  return {
    endpoint: requireEnv('APPWRITE_ENDPOINT'),
    projectId: requireEnv('APPWRITE_PROJECT_ID'),
    apiKey: requireEnv('APPWRITE_API_KEY'),
    databaseId: APPWRITE_DATABASE_ID,
    teamAdminsId: APPWRITE_TEAM_ADMINS_ID,
    collections: APPWRITE_COLLECTIONS,
  };
}
