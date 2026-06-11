/**
 * Supabase service-role client for offline migration scripts.
 *
 * Uses the service-role key (bypasses RLS) to read all rows from every table.
 * Never imported by app code — this file lives in scripts/migration only.
 *
 * Required env vars:
 *   SUPABASE_URL          — project URL (e.g. https://xxx.supabase.co)
 *   SUPABASE_SERVICE_ROLE_KEY — service-role secret key (never the anon key)
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`,
    );
  }
  return value;
}

let _client: SupabaseClient | null = null;

/** Returns a cached Supabase service-role client. */
export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      requireEnv('SUPABASE_URL'),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }
  return _client;
}
