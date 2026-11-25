import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  queryEqual: vi.fn((field: string, value: unknown) => `equal(${field}=${JSON.stringify(value)})`),
  queryLimit: vi.fn((value: number) => `limit(${value})`),
  createEmailPasswordSession: vi.fn(),
  deleteSession: vi.fn(),
  listMemberships: vi.fn(),
  getUser: vi.fn(),
  listUsers: vi.fn(),
  deleteSessions: vi.fn(),
  createRecovery: vi.fn(),
  updateRecovery: vi.fn(),
}));

class MockAppwriteException extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

vi.mock('node-appwrite', () => ({
  AppwriteException: MockAppwriteException,
  Query: {
    equal: mocks.queryEqual,
    limit: mocks.queryLimit,
  },
}));

vi.mock('@/lib/appwrite/admin', () => ({
  createAdminClient: () => ({
    account: {
      createEmailPasswordSession: mocks.createEmailPasswordSession,
      createRecovery: mocks.createRecovery,
      updateRecovery: mocks.updateRecovery,
    },
    teams: { listMemberships: mocks.listMemberships },
    users: { list: mocks.listUsers, deleteSessions: mocks.deleteSessions },
  }),
}));

vi.mock('@/lib/appwrite/session', () => ({
  createSessionClient: () => ({
    account: { deleteSession: mocks.deleteSession },
  }),
}));

vi.mock('@/lib/appwrite/account', () => ({
  getUser: mocks.getUser,
}));

vi.mock('@/lib/appwrite/config', () => ({
  getAppwriteConfig: () => ({ teamAdminsId: 'admins' }),
}));

const { appwriteAuthProvider } = await import('./appwriteProvider');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('appwriteAuthProvider.login', () => {
  it('returns ok with the mapped session on success', async () => {
    mocks.createEmailPasswordSession.mockResolvedValueOnce({
      secret: 'secret-1',
      expire: '2026-01-01T00:00:00.000Z',
      userId: 'user-1',
    });

    const result = await appwriteAuthProvider.login('user@example.com', 'password');

    expect(result).toEqual({
      ok: true,
      userId: 'user-1',
      session: { secret: 'secret-1', expiresAt: '2026-01-01T00:00:00.000Z' },
    });
    expect(mocks.createEmailPasswordSession).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password',
    });
  });

  it('returns INVALID_CREDENTIALS on a 401 AppwriteException', async () => {
    mocks.createEmailPasswordSession.mockRejectedValueOnce(
      new MockAppwriteException('Invalid credentials', 401),
    );

    const result = await appwriteAuthProvider.login('user@example.com', 'wrong');

    expect(result).toEqual({
      ok: false,
      code: 'INVALID_CREDENTIALS',
      message: 'Credenciales incorrectas. Intenta de nuevo.',
    });
  });

  it('returns INTERNAL on any other error', async () => {
    mocks.createEmailPasswordSession.mockRejectedValueOnce(new Error('network down'));

    const result = await appwriteAuthProvider.login('user@example.com', 'password');

    expect(result).toEqual({
      ok: false,
      code: 'INTERNAL',
      message: 'No se pudo iniciar sesión. Intenta de nuevo.',
    });
  });
});

describe('appwriteAuthProvider.logout', () => {
  it('returns true when the delete session call succeeds', async () => {
    mocks.deleteSession.mockResolvedValueOnce(undefined);

    await expect(appwriteAuthProvider.logout('secret-1')).resolves.toBe(true);
    expect(mocks.deleteSession).toHaveBeenCalledTimes(1);
    expect(mocks.deleteSession).toHaveBeenCalledWith({ sessionId: 'current' });
  });

  it('retries once and returns true when the retry succeeds', async () => {
    mocks.deleteSession
      .mockRejectedValueOnce(new Error('network blip'))
      .mockResolvedValueOnce(undefined);

    await expect(appwriteAuthProvider.logout('secret-1')).resolves.toBe(true);
    expect(mocks.deleteSession).toHaveBeenCalledTimes(2);
  });

  it('returns false instead of throwing when both attempts fail', async () => {
    mocks.deleteSession
      .mockRejectedValueOnce(new Error('session already gone'))
      .mockRejectedValueOnce(new Error('session already gone'));

    await expect(appwriteAuthProvider.logout('secret-1')).resolves.toBe(false);
    expect(mocks.deleteSession).toHaveBeenCalledTimes(2);
  });
});

describe('appwriteAuthProvider.getCurrentUser', () => {
  it('maps a found user to id and email', async () => {
    mocks.getUser.mockResolvedValueOnce({ $id: 'user-1', email: 'user@example.com' });

    const result = await appwriteAuthProvider.getCurrentUser('secret-1');

    expect(result).toEqual({ id: 'user-1', email: 'user@example.com' });
  });

  it('returns null when getUser returns null', async () => {
    mocks.getUser.mockResolvedValueOnce(null);

    await expect(appwriteAuthProvider.getCurrentUser('secret-1')).resolves.toBeNull();
  });
});

describe('appwriteAuthProvider.isAdmin', () => {
  it('returns true when a membership matches the userId and is confirmed', async () => {
    mocks.listMemberships.mockResolvedValueOnce({
      memberships: [{ userId: 'user-1', confirm: true }],
    });

    await expect(appwriteAuthProvider.isAdmin('user-1')).resolves.toBe(true);
    expect(mocks.listMemberships).toHaveBeenCalledWith({
      teamId: 'admins',
      queries: ['equal(userId=["user-1"])', 'limit(1)'],
    });
  });

  it('returns false when the matching membership is not confirmed', async () => {
    mocks.listMemberships.mockResolvedValueOnce({
      memberships: [{ userId: 'user-1', confirm: false }],
    });

    await expect(appwriteAuthProvider.isAdmin('user-1')).resolves.toBe(false);
  });

  it('returns false when memberships are empty', async () => {
    mocks.listMemberships.mockResolvedValueOnce({ memberships: [] });

    await expect(appwriteAuthProvider.isAdmin('user-1')).resolves.toBe(false);
  });

  it('returns false instead of throwing when the Appwrite call errors', async () => {
    mocks.listMemberships.mockRejectedValueOnce(new Error('network down'));

    await expect(appwriteAuthProvider.isAdmin('user-1')).resolves.toBe(false);
  });
});

describe('appwriteAuthProvider.requestPasswordRecovery', () => {
  const redirectUrl = 'https://www.example.com/restablecer-contrasena';

  it('sends the recovery email to a confirmed admin', async () => {
    mocks.listUsers.mockResolvedValueOnce({ users: [{ $id: 'user-1', email: 'admin@example.com' }] });
    mocks.listMemberships.mockResolvedValueOnce({ memberships: [{ userId: 'user-1', confirm: true }] });
    mocks.createRecovery.mockResolvedValueOnce({});

    await expect(
      appwriteAuthProvider.requestPasswordRecovery('admin@example.com', redirectUrl),
    ).resolves.toBeUndefined();

    expect(mocks.listUsers).toHaveBeenCalledWith({
      queries: ['equal(email=["admin@example.com"])', 'limit(1)'],
    });
    expect(mocks.createRecovery).toHaveBeenCalledWith({
      email: 'admin@example.com',
      url: redirectUrl,
    });
  });

  it('resolves silently without sending when no user has that email', async () => {
    mocks.listUsers.mockResolvedValueOnce({ users: [] });

    await expect(
      appwriteAuthProvider.requestPasswordRecovery('nobody@example.com', redirectUrl),
    ).resolves.toBeUndefined();

    expect(mocks.listMemberships).not.toHaveBeenCalled();
    expect(mocks.createRecovery).not.toHaveBeenCalled();
  });

  it('resolves silently without sending when the user is not a confirmed admin', async () => {
    mocks.listUsers.mockResolvedValueOnce({ users: [{ $id: 'user-2', email: 'client@example.com' }] });
    mocks.listMemberships.mockResolvedValueOnce({ memberships: [{ userId: 'user-2', confirm: false }] });

    await expect(
      appwriteAuthProvider.requestPasswordRecovery('client@example.com', redirectUrl),
    ).resolves.toBeUndefined();

    expect(mocks.createRecovery).not.toHaveBeenCalled();
  });

  it('swallows an Appwrite error and logs it without the email', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.listUsers.mockResolvedValueOnce({ users: [{ $id: 'user-1', email: 'admin@example.com' }] });
    mocks.listMemberships.mockResolvedValueOnce({ memberships: [{ userId: 'user-1', confirm: true }] });
    mocks.createRecovery.mockRejectedValueOnce(
      new MockAppwriteException('Invalid url for admin@example.com', 400),
    );

    await expect(
      appwriteAuthProvider.requestPasswordRecovery('admin@example.com', redirectUrl),
    ).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain('admin@example.com');
    errorSpy.mockRestore();
  });

  it('swallows a lookup failure without sending', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.listUsers.mockRejectedValueOnce(new Error('network down'));

    await expect(
      appwriteAuthProvider.requestPasswordRecovery('admin@example.com', redirectUrl),
    ).resolves.toBeUndefined();

    expect(mocks.createRecovery).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

describe('appwriteAuthProvider.completePasswordRecovery', () => {
  it('updates the password and revokes every session of the user', async () => {
    mocks.updateRecovery.mockResolvedValueOnce({});
    mocks.deleteSessions.mockResolvedValueOnce({});

    await expect(
      appwriteAuthProvider.completePasswordRecovery('user-1', 'secret-1', 'a-long-new-password'),
    ).resolves.toEqual({ ok: true });

    expect(mocks.updateRecovery).toHaveBeenCalledWith({
      userId: 'user-1',
      secret: 'secret-1',
      password: 'a-long-new-password',
    });
    expect(mocks.deleteSessions).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(mocks.updateRecovery.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.deleteSessions.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it('still reports success and logs when revoking the sessions fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.updateRecovery.mockResolvedValueOnce({});
    mocks.deleteSessions.mockRejectedValueOnce(new Error('network down'));

    await expect(
      appwriteAuthProvider.completePasswordRecovery('user-1', 'secret-1', 'a-long-new-password'),
    ).resolves.toEqual({ ok: true });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    errorSpy.mockRestore();
  });

  it.each([
    [401, 'INVALID_LINK'],
    [404, 'INVALID_LINK'],
    [400, 'WEAK_PASSWORD'],
  ])('maps an Appwrite %i to %s without revoking sessions', async (status, code) => {
    mocks.updateRecovery.mockRejectedValueOnce(new MockAppwriteException('rejected', status));

    await expect(
      appwriteAuthProvider.completePasswordRecovery('user-1', 'secret-1', 'a-long-new-password'),
    ).resolves.toMatchObject({ ok: false, code });

    expect(mocks.deleteSessions).not.toHaveBeenCalled();
  });

  it('maps any other error to INTERNAL', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.updateRecovery.mockRejectedValueOnce(new Error('network down'));

    await expect(
      appwriteAuthProvider.completePasswordRecovery('user-1', 'secret-1', 'a-long-new-password'),
    ).resolves.toMatchObject({ ok: false, code: 'INTERNAL' });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain('secret-1');
    errorSpy.mockRestore();
  });
});
