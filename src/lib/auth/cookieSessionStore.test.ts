import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: mocks.get, set: mocks.set, delete: mocks.delete }),
}));

const { cookieSessionStore } = await import('./cookieSessionStore');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('cookieSessionStore', () => {
  it('reads the session from the __Host- prefixed cookie', async () => {
    mocks.get.mockReturnValueOnce({ value: 'secret-1' });

    await expect(cookieSessionStore.get()).resolves.toBe('secret-1');
    expect(mocks.get).toHaveBeenCalledWith('__Host-a_session');
  });

  it('sets a Secure, HttpOnly, SameSite=Lax, Path=/ cookie without a domain', async () => {
    await cookieSessionStore.set({ secret: 'secret-1', expiresAt: '2026-01-01T00:00:00.000Z' });

    expect(mocks.set).toHaveBeenCalledWith('__Host-a_session', 'secret-1', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date('2026-01-01T00:00:00.000Z'),
    });
    const options = mocks.set.mock.calls[0][2] as Record<string, unknown>;
    expect(options).not.toHaveProperty('domain');
  });

  it('expires the cookie with the same Secure and Path attributes on delete', async () => {
    await cookieSessionStore.delete();

    expect(mocks.set).toHaveBeenCalledWith('__Host-a_session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    expect(mocks.delete).not.toHaveBeenCalled();
  });
});
