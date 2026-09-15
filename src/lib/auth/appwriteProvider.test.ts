import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  queryEqual: vi.fn((field: string, value: unknown) => `equal(${field}=${JSON.stringify(value)})`),
  queryLimit: vi.fn((value: number) => `limit(${value})`),
  createEmailPasswordSession: vi.fn(),
  deleteSession: vi.fn(),
  listMemberships: vi.fn(),
  getUser: vi.fn(),
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
    account: { createEmailPasswordSession: mocks.createEmailPasswordSession },
    teams: { listMemberships: mocks.listMemberships },
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
    });

    const result = await appwriteAuthProvider.login('user@example.com', 'password');

    expect(result).toEqual({
      ok: true,
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
  it('resolves even when the underlying delete session call throws', async () => {
    mocks.deleteSession.mockRejectedValueOnce(new Error('session already gone'));

    await expect(appwriteAuthProvider.logout('secret-1')).resolves.toBeUndefined();
    expect(mocks.deleteSession).toHaveBeenCalledWith({ sessionId: 'current' });
  });

  it('resolves when the delete session call succeeds', async () => {
    mocks.deleteSession.mockResolvedValueOnce(undefined);

    await expect(appwriteAuthProvider.logout('secret-1')).resolves.toBeUndefined();
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
