import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthError } from './errors';
import { createAuthService } from './service';
import type { AuthProvider, AuthSession, SessionStore } from './types';

function memorySessions(initial?: string): SessionStore & { token: string | null } {
  const store = {
    token: initial ?? null,
    async get() {
      return store.token;
    },
    async set(session: AuthSession) {
      store.token = session.secret;
    },
    async delete() {
      store.token = null;
    },
  };
  return store;
}

function fakeProvider(overrides: Partial<AuthProvider> = {}): AuthProvider {
  return {
    login: vi.fn(),
    logout: vi.fn().mockResolvedValue(true),
    getCurrentUser: vi.fn(),
    isAdmin: vi.fn(),
    requestPasswordRecovery: vi.fn().mockResolvedValue(undefined),
    completePasswordRecovery: vi.fn().mockResolvedValue({ ok: true }),
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

function successfulLogin() {
  return vi.fn().mockResolvedValue({
    ok: true,
    userId: 'user-1',
    session: { secret: 'secret-1', expiresAt: '2026-01-01T00:00:00.000Z' },
  });
}

describe('createAuthService.login', () => {
  it('stores the session of an admin and hides the secret from the caller', async () => {
    const sessions = memorySessions();
    const provider = fakeProvider({
      login: successfulLogin(),
      isAdmin: vi.fn().mockResolvedValue(true),
    });
    const auth = createAuthService(provider, sessions);

    await expect(auth.login('user@example.com', 'password')).resolves.toEqual({ ok: true });
    expect(provider.isAdmin).toHaveBeenCalledWith('user-1');
    expect(sessions.token).toBe('secret-1');
    expect(provider.logout).not.toHaveBeenCalled();
  });

  it('refuses a non-admin, revokes the new session and never stores it', async () => {
    const sessions = memorySessions();
    const provider = fakeProvider({
      login: successfulLogin(),
      isAdmin: vi.fn().mockResolvedValue(false),
    });
    const auth = createAuthService(provider, sessions);

    await expect(auth.login('user@example.com', 'password')).resolves.toEqual({
      ok: false,
      code: 'FORBIDDEN',
      message: 'Tu usuario no tiene permisos de administrador.',
    });
    expect(provider.logout).toHaveBeenCalledWith('secret-1');
    expect(sessions.token).toBeNull();
  });

  it('does not write a session when login fails', async () => {
    const sessions = memorySessions();
    const provider = fakeProvider({
      login: vi.fn().mockResolvedValue({
        ok: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Credenciales incorrectas. Intenta de nuevo.',
      }),
    });
    const auth = createAuthService(provider, sessions);

    await expect(auth.login('user@example.com', 'wrong')).resolves.toEqual({
      ok: false,
      code: 'INVALID_CREDENTIALS',
      message: 'Credenciales incorrectas. Intenta de nuevo.',
    });
    expect(sessions.token).toBeNull();
  });
});

describe('createAuthService.logout', () => {
  it('revokes the provider session and clears the store', async () => {
    const sessions = memorySessions('secret-1');
    const provider = fakeProvider();
    const auth = createAuthService(provider, sessions);

    await auth.logout();

    expect(provider.logout).toHaveBeenCalledWith('secret-1');
    expect(sessions.token).toBeNull();
  });

  it('clears the store even when there is no token', async () => {
    const sessions = memorySessions();
    const provider = fakeProvider();
    const auth = createAuthService(provider, sessions);

    await auth.logout();

    expect(provider.logout).not.toHaveBeenCalled();
    expect(sessions.token).toBeNull();
  });

  it('clears the store even when provider.logout throws', async () => {
    const sessions = memorySessions('secret-1');
    const provider = fakeProvider({
      logout: vi.fn().mockRejectedValue(new Error('network down')),
    });
    const auth = createAuthService(provider, sessions);

    await expect(auth.logout()).rejects.toThrow('network down');
    expect(sessions.token).toBeNull();
  });

  it('clears the store and reports the failure when the revoke fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const sessions = memorySessions('secret-1');
    const provider = fakeProvider({ logout: vi.fn().mockResolvedValue(false) });
    const auth = createAuthService(provider, sessions);

    await auth.logout();

    expect(sessions.token).toBeNull();
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});

describe('createAuthService.clearSession', () => {
  it('deletes the stored session without calling the provider', async () => {
    const sessions = memorySessions('stale-secret');
    const provider = fakeProvider();
    const auth = createAuthService(provider, sessions);

    await auth.clearSession();

    expect(sessions.token).toBeNull();
    expect(provider.logout).not.toHaveBeenCalled();
  });
});

describe('createAuthService.requireAdmin', () => {
  it('throws UNAUTHENTICATED when there is no session', async () => {
    const auth = createAuthService(fakeProvider(), memorySessions());

    await expect(auth.requireAdmin()).rejects.toMatchObject({
      code: 'UNAUTHENTICATED',
    });
  });

  it('throws UNAUTHENTICATED when the session user is gone', async () => {
    const provider = fakeProvider({
      getCurrentUser: vi.fn().mockResolvedValue(null),
    });
    const auth = createAuthService(provider, memorySessions('secret-1'));

    await expect(auth.requireAdmin()).rejects.toBeInstanceOf(AuthError);
    await expect(auth.requireAdmin()).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
  });

  it('throws FORBIDDEN when the user is not an admin', async () => {
    const provider = fakeProvider({
      getCurrentUser: vi.fn().mockResolvedValue({ id: 'user-1', email: 'user@example.com' }),
      isAdmin: vi.fn().mockResolvedValue(false),
    });
    const auth = createAuthService(provider, memorySessions('secret-1'));

    await expect(auth.requireAdmin()).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('returns the user when the session belongs to an admin', async () => {
    const user = { id: 'user-1', email: 'user@example.com' };
    const provider = fakeProvider({
      getCurrentUser: vi.fn().mockResolvedValue(user),
      isAdmin: vi.fn().mockResolvedValue(true),
    });
    const auth = createAuthService(provider, memorySessions('secret-1'));

    await expect(auth.requireAdmin()).resolves.toEqual(user);
    expect(provider.getCurrentUser).toHaveBeenCalledWith('secret-1');
    expect(provider.isAdmin).toHaveBeenCalledWith('user-1');
  });
});

describe('createAuthService.requestPasswordRecovery', () => {
  it('delegates to the provider with the email and redirect url', async () => {
    const provider = fakeProvider();
    const auth = createAuthService(provider, memorySessions());

    await expect(
      auth.requestPasswordRecovery('admin@example.com', 'https://example.com/restablecer-contrasena'),
    ).resolves.toBeUndefined();
    expect(provider.requestPasswordRecovery).toHaveBeenCalledWith(
      'admin@example.com',
      'https://example.com/restablecer-contrasena',
    );
  });
});

describe('createAuthService.completePasswordRecovery', () => {
  it('returns the provider result untouched', async () => {
    const failure = {
      ok: false,
      code: 'INVALID_LINK',
      message: 'El enlace no es válido o ya venció. Solicita uno nuevo.',
    } as const;
    const provider = fakeProvider({
      completePasswordRecovery: vi.fn().mockResolvedValue(failure),
    });
    const auth = createAuthService(provider, memorySessions());

    await expect(
      auth.completePasswordRecovery('user-1', 'secret-1', 'a-long-new-password'),
    ).resolves.toEqual(failure);
    expect(provider.completePasswordRecovery).toHaveBeenCalledWith(
      'user-1',
      'secret-1',
      'a-long-new-password',
    );
  });
});
