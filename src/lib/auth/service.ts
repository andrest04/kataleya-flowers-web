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
      await sessions.set(result.session);
      return { ok: true };
    },

    async logout() {
      const token = await sessions.get();
      try {
        if (token) await provider.logout(token);
      } finally {
        await sessions.delete();
      }
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
  };
}
