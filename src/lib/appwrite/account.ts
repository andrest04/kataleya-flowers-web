import type { Models } from 'node-appwrite';

import { createSessionClient } from '@/lib/appwrite/session';

export type AppwriteUser = Models.User<Models.Preferences>;

export async function getUser(
  sessionSecret: string,
): Promise<AppwriteUser | null> {
  try {
    const { account } = createSessionClient(sessionSecret);
    return await account.get();
  } catch {
    return null;
  }
}
