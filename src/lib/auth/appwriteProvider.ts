import { AppwriteException, Query } from 'node-appwrite';

import { getUser } from '@/lib/appwrite/account';
import { createAdminClient } from '@/lib/appwrite/admin';
import { getAppwriteConfig } from '@/lib/appwrite/config';
import { createSessionClient } from '@/lib/appwrite/session';

import type { AuthLoginResult, AuthProvider, AuthUser } from './types';

class AppwriteAuthProvider implements AuthProvider {
  async login(email: string, password: string): Promise<AuthLoginResult> {
    try {
      const { account } = createAdminClient();
      const session = await account.createEmailPasswordSession({ email, password });
      return { ok: true, session: { secret: session.secret, expiresAt: session.expire } };
    } catch (error) {
      if (error instanceof AppwriteException && error.code === 401) {
        return {
          ok: false,
          code: 'INVALID_CREDENTIALS',
          message: 'Credenciales incorrectas. Intenta de nuevo.',
        };
      }
      console.error('[auth] login error:', error);
      return {
        ok: false,
        code: 'INTERNAL',
        message: 'No se pudo iniciar sesión. Intenta de nuevo.',
      };
    }
  }

  async logout(sessionSecret: string): Promise<void> {
    try {
      const { account } = createSessionClient(sessionSecret);
      await account.deleteSession({ sessionId: 'current' });
    } catch (error) {
      console.error('[auth] logout error:', error);
    }
  }

  async getCurrentUser(sessionSecret: string): Promise<AuthUser | null> {
    const user = await getUser(sessionSecret);
    if (!user) return null;
    return { id: user.$id, email: user.email };
  }

  async isAdmin(userId: string): Promise<boolean> {
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
      console.error('[auth] isAdmin error:', { userId, error });
      return false;
    }
  }
}

export const appwriteAuthProvider: AuthProvider = new AppwriteAuthProvider();
