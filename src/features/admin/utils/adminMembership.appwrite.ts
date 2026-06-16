// Server-only: Appwrite admin-membership check.
//
// Resolves admin membership via the Appwrite `admins` Team. Same contract as
// `isAdminUser`: returns a boolean and
// never throws (logs and returns false on error), so callers fail closed.
import { Query } from 'node-appwrite';

import { createAdminClient } from '@/lib/appwrite/admin';
import { getAppwriteConfig } from '@/lib/appwrite/config';

/**
 * Returns true when `userId` is a confirmed member of the admin Team.
 *
 * Uses the admin (API-key) client to query Team memberships server-side —
 * anonymous callers can never reach this. Mirrors `isAdminUser`: on any error
 * it logs (without secrets) and returns false, so authorization fails closed.
 */
export async function isAdminUserAppwrite(userId: string): Promise<boolean> {
  try {
    const { teams } = createAdminClient();
    const { teamAdminsId } = getAppwriteConfig();

    const memberships = await teams.listMemberships({
      teamId: teamAdminsId,
      queries: [Query.equal('userId', [userId]), Query.limit(1)],
    });

    return memberships.memberships.some(
      (membership) => membership.userId === userId && membership.confirm,
    );
  } catch (error) {
    console.error('[admin-membership] failed to resolve admin membership:', {
      userId,
      error,
    });
    return false;
  }
}
