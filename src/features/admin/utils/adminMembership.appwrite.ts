import { Query } from 'node-appwrite';

import { createAdminClient } from '@/lib/appwrite/admin';
import { getAppwriteConfig } from '@/lib/appwrite/config';

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
