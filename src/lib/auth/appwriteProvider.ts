import { AppwriteException, Query } from 'node-appwrite';

import { getUser } from '@/lib/appwrite/account';
import { createAdminClient } from '@/lib/appwrite/admin';
import { getAppwriteConfig } from '@/lib/appwrite/config';
import { createSessionClient } from '@/lib/appwrite/session';

import type { AuthLoginResult, AuthProvider, AuthUser, PasswordRecoveryResult } from './types';

const LOGOUT_ATTEMPTS = 2;

const INVALID_LINK_STATUSES = new Set([401, 404]);

const INVALID_LINK_FAILURE: PasswordRecoveryResult = {
  ok: false,
  code: 'INVALID_LINK',
  message: 'El enlace no es válido o ya venció. Solicita uno nuevo.',
};

const WEAK_PASSWORD_FAILURE: PasswordRecoveryResult = {
  ok: false,
  code: 'WEAK_PASSWORD',
  message: 'Elige otra contraseña. Evita contraseñas comunes o que ya hayas usado.',
};

const RECOVERY_INTERNAL_FAILURE: PasswordRecoveryResult = {
  ok: false,
  code: 'INTERNAL',
  message: 'No se pudo cambiar la contraseña. Intenta de nuevo.',
};

function errorSummary(error: unknown) {
  if (error instanceof AppwriteException) {
    return { code: error.code, type: error.type };
  }
  return { name: error instanceof Error ? error.name : typeof error };
}

class AppwriteAuthProvider implements AuthProvider {
  async login(email: string, password: string): Promise<AuthLoginResult> {
    try {
      const { account } = createAdminClient();
      const session = await account.createEmailPasswordSession({ email, password });
      return {
        ok: true,
        userId: session.userId,
        session: { secret: session.secret, expiresAt: session.expire },
      };
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

  async logout(sessionSecret: string): Promise<boolean> {
    for (let attempt = 1; attempt <= LOGOUT_ATTEMPTS; attempt += 1) {
      try {
        const { account } = createSessionClient(sessionSecret);
        await account.deleteSession({ sessionId: 'current' });
        return true;
      } catch (error) {
        console.error('[auth] logout error:', { attempt, error });
      }
    }
    return false;
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

  async requestPasswordRecovery(email: string, redirectUrl: string): Promise<void> {
    try {
      const { users, account } = createAdminClient();
      const { users: matches } = await users.list({
        queries: [Query.equal('email', [email]), Query.limit(1)],
      });
      const user = matches[0];
      if (!user || !(await this.isAdmin(user.$id))) return;

      await account.createRecovery({ email: user.email, url: redirectUrl });
    } catch (error) {
      console.error('[auth] password recovery request failed:', errorSummary(error));
    }
  }

  async completePasswordRecovery(
    userId: string,
    secret: string,
    password: string,
  ): Promise<PasswordRecoveryResult> {
    try {
      const { account } = createAdminClient();
      await account.updateRecovery({ userId, secret, password });
    } catch (error) {
      if (error instanceof AppwriteException && INVALID_LINK_STATUSES.has(error.code)) {
        return INVALID_LINK_FAILURE;
      }
      if (error instanceof AppwriteException && error.code === 400) {
        return WEAK_PASSWORD_FAILURE;
      }
      console.error('[auth] password recovery update failed:', errorSummary(error));
      return RECOVERY_INTERNAL_FAILURE;
    }

    await this.revokeAllSessions(userId);
    return { ok: true };
  }

  private async revokeAllSessions(userId: string): Promise<void> {
    try {
      const { users } = createAdminClient();
      await users.deleteSessions({ userId });
    } catch (error) {
      console.error('[auth] could not revoke sessions after a password reset:', {
        userId,
        error: errorSummary(error),
      });
    }
  }
}

export const appwriteAuthProvider: AuthProvider = new AppwriteAuthProvider();
