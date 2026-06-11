/**
 * Appwrite environment configuration and collection IDs.
 *
 * This module is additive: Supabase remains the live backend until the
 * `BACKEND=appwrite` cutover. Therefore env validation MUST be lazy — it only
 * fails loudly when Appwrite is actually selected (`BACKEND=appwrite`) or when a
 * consumer explicitly resolves the config. Importing this file with
 * `BACKEND=supabase` or unset MUST NOT throw, so the live Supabase build is
 * never broken by missing Appwrite env vars.
 */

/** Active backend selector. Defaults to `supabase` while Appwrite is staged. */
export type Backend = 'supabase' | 'appwrite';

export function getBackend(): Backend {
  return process.env.BACKEND === 'appwrite' ? 'appwrite' : 'supabase';
}

export function isAppwriteBackend(): boolean {
  return getBackend() === 'appwrite';
}

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
    throw new Error(
      `Missing Appwrite environment variable: ${name} is required when BACKEND=appwrite.`,
    );
  }
  return value;
}

/**
 * Development-only backend consistency check.
 *
 * Logs a clear operator error when BACKEND and NEXT_PUBLIC_BACKEND are both
 * set but do not match. This indicates a split-brain deployment configuration
 * that would route the client (login form, LogoutButton) to the wrong path.
 *
 * NEVER throws at import time — config.ts must remain lazy/import-safe so that
 * Supabase builds are never broken by missing Appwrite env vars. Only emits a
 * console.error; enforcement is intentionally soft (dev warning, not a fatal).
 */
export function assertBackendConsistency(): void {
  if (process.env.NODE_ENV !== 'development') return;
  const server = process.env.BACKEND;
  const client = process.env.NEXT_PUBLIC_BACKEND;
  if (server && client && server !== client) {
    console.error(
      `[appwrite/config] BACKEND_MISMATCH detected: BACKEND="${server}" but ` +
        `NEXT_PUBLIC_BACKEND="${client}". Both vars must be identical at cutover. ` +
        'Login and logout will route to different backends — this is a deployment error.',
    );
  }
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
