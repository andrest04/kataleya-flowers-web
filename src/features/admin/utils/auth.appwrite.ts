import type { AppwriteUser } from '@/lib/appwrite/account';
import { getUser } from '@/lib/appwrite/account';
import { createAdminClient } from '@/lib/appwrite/admin';
import { getSessionCookie } from '@/lib/appwrite/cookies';

import { isAdminUserAppwrite } from './adminMembership.appwrite';
import { AdminAuthError } from './auth';

type AdminDatabasesClient = ReturnType<typeof createAdminClient>['databases'];

export interface AppwriteAdminActionContext {
  user: AppwriteUser;
  databases: AdminDatabasesClient;
}

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
