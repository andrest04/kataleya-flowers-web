import { AuthError } from './errors';
import type { AuthProvider, AuthService, SessionStore } from './types';

export function createAuthService(
  provider: AuthProvider,
  sessions: SessionStore,
): AuthService {
  return {
    async login(email, password) {
      const result = await provider.login(email, password);
      if (!result.ok) return result;

      if (!(await provider.isAdmin(result.userId))) {
        if (!(await provider.logout(result.session.secret))) {
          console.error('[auth] could not revoke the session of a non-admin login');
        }
        return {
          ok: false,
          code: 'FORBIDDEN',
          message: 'Tu usuario no tiene permisos de administrador.',
        };
      }

      await sessions.set(result.session);
      return { ok: true };
    },

    async logout() {
      const token = await sessions.get();
      try {
        if (token && !(await provider.logout(token))) {
          console.error('[auth] logout could not revoke the provider session');
        }
      } finally {
        await sessions.delete();
      }
    },

    async clearSession() {
      await sessions.delete();
    },

    async requireAdmin() {
      const token = await sessions.get();
      if (!token) {
        throw new AuthError('UNAUTHENTICATED', 'Sesión inválida o expirada');
      }

      const user = await provider.getCurrentUser(token);
      if (!user) {
        throw new AuthError('UNAUTHENTICATED', 'Sesión inválida o expirada');
      }

      if (!(await provider.isAdmin(user.id))) {
        throw new AuthError('FORBIDDEN', 'No tienes permisos de administrador');
      }

      return user;
    },

    requestPasswordRecovery(email, redirectUrl) {
      return provider.requestPasswordRecovery(email, redirectUrl);
    },

    completePasswordRecovery(userId, secret, password) {
      return provider.completePasswordRecovery(userId, secret, password);
    },
  };
}
