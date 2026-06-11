// Server-only: Appwrite admin authorization guard.
//
// Mirrors `requireAdmin()` from `auth.ts` but resolves the session from the
// Appwrite `a_session` cookie and checks membership in the `admins` Team. It
// throws the SAME `AdminAuthError` with the SAME `UNAUTHENTICATED`/`FORBIDDEN`
// codes, so the `Result<T>` contract, error codes, and `failureFromUnknown`
// mapping stay byte-for-byte identical to the Supabase path.
import type { AppwriteUser } from '@/lib/appwrite/account';
import { getUser } from '@/lib/appwrite/account';
import { createAdminClient } from '@/lib/appwrite/admin';
import { getSessionCookie } from '@/lib/appwrite/cookies';

import { isAdminUserAppwrite } from './adminMembership.appwrite';
import { AdminAuthError } from './auth';

/** Admin databases client (API key) — server-only, never bundled client-side. */
type AdminDatabasesClient = ReturnType<typeof createAdminClient>['databases'];

/**
 * Appwrite admin action context. Shape mirrors the Supabase
 * `AdminActionContext` (an authenticated `user` plus a privileged data client),
 * with the Appwrite admin `databases` client in place of the Supabase client.
 */
export interface AppwriteAdminActionContext {
  user: AppwriteUser;
  databases: AdminDatabasesClient;
}

/**
 * Verifies a valid Appwrite session AND confirmed membership in the admin Team.
 *
 * Resolves the user from the `a_session` cookie via `getUser()` (which validates
 * against Appwrite, never trusting cookie presence alone — defense-in-depth that
 * matches `requireAdmin()`'s `auth.getUser()`). Throws `UNAUTHENTICATED` when
 * there is no valid session and `FORBIDDEN` when the user is not an admin.
 */
export async function requireAdminAppwrite(): Promise<AppwriteAdminActionContext> {
  const sessionSecret = await getSessionCookie();
  if (!sessionSecret) {
    throw new AdminAuthError('UNAUTHENTICATED', 'Sesión inválida o expirada');
  }

  const user = await getUser(sessionSecret);
  if (!user) {
    throw new AdminAuthError('UNAUTHENTICATED', 'Sesión inválida o expirada');
  }

  const isAdmin = await isAdminUserAppwrite(user.$id);
  if (!isAdmin) {
    throw new AdminAuthError('FORBIDDEN', 'No tienes permisos de administrador');
  }

  const { databases } = createAdminClient();
  return { user, databases };
}
