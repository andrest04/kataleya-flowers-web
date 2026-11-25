import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const counts = new Map<string, number>();
  return {
    counts,
    checkBotId: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    clearSession: vi.fn(),
    clientKey: vi.fn(() => '203.0.113.7'),
    hit: vi.fn(async (scope: string, key: string, policy: { limit: number }) => {
      const id = `${scope}:${key}`;
      const count = (counts.get(id) ?? 0) + 1;
      counts.set(id, count);
      return { allowed: count <= policy.limit, count };
    }),
  };
});

vi.mock('botid/server', () => ({ checkBotId: mocks.checkBotId }));

vi.mock('next/headers', () => ({ headers: async () => new Headers() }));

vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

vi.mock('@/lib/rateLimit', () => ({
  rateLimiter: { hit: mocks.hit },
  clientKeyFromHeaders: mocks.clientKey,
}));

vi.mock('@/lib/auth', () => ({
  auth: { login: mocks.login, logout: mocks.logout, clearSession: mocks.clearSession },
}));

const { clearStaleSessionAction, loginAction } = await import('./auth');

beforeEach(() => {
  vi.clearAllMocks();
  mocks.counts.clear();
  mocks.checkBotId.mockResolvedValue({ isBot: false });
  mocks.login.mockResolvedValue({ ok: true });
  mocks.clientKey.mockReturnValue('203.0.113.7');
});

describe('loginAction', () => {
  it('returns RATE_LIMITED on the 6th attempt for the same email without calling auth.login', async () => {
    const emails = ['Admin@Example.com', 'admin@example.com', 'ADMIN@example.com', 'admin@example.com', 'admin@EXAMPLE.com'];
    for (const email of emails) {
      await expect(loginAction({ email, password: 'secret' })).resolves.toEqual({ ok: true });
    }

    const sixth = await loginAction({ email: 'admin@example.com', password: 'secret' });

    expect(sixth).toMatchObject({ ok: false, code: 'RATE_LIMITED' });
    expect(mocks.login).toHaveBeenCalledTimes(5);
    expect(mocks.hit).toHaveBeenCalledWith('login-email', 'admin@example.com', {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
  });

  it('returns RATE_LIMITED on the 21st attempt from the same client across emails', async () => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await loginAction({ email: `user${attempt}@example.com`, password: 'secret' });
    }

    const result = await loginAction({ email: 'other@example.com', password: 'secret' });

    expect(result).toMatchObject({ ok: false, code: 'RATE_LIMITED' });
    expect(mocks.login).toHaveBeenCalledTimes(20);
    expect(mocks.hit).toHaveBeenCalledWith('login-ip', '203.0.113.7', {
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });
  });

  it('returns before the limiter runs when BotID flags the request', async () => {
    mocks.checkBotId.mockResolvedValueOnce({ isBot: true });

    const result = await loginAction({ email: 'admin@example.com', password: 'secret' });

    expect(result).toMatchObject({ ok: false, code: 'INTERNAL' });
    expect(mocks.hit).not.toHaveBeenCalled();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it('fails closed without calling auth.login when the limiter store is unavailable', async () => {
    vi.spyOn(console, 'error').mockImplementationOnce(() => undefined);
    mocks.hit.mockRejectedValueOnce(new Error('rate_limits collection missing'));

    const result = await loginAction({ email: 'admin@example.com', password: 'secret' });

    expect(result).toMatchObject({ ok: false, code: 'INTERNAL' });
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it('returns VALIDATION without touching the limiter for malformed input', async () => {
    const result = await loginAction({ email: 'not-an-email', password: 'secret' });

    expect(result).toMatchObject({ ok: false, code: 'VALIDATION' });
    expect(mocks.hit).not.toHaveBeenCalled();
  });

  it('propagates FORBIDDEN from the auth service', async () => {
    mocks.login.mockResolvedValueOnce({
      ok: false,
      code: 'FORBIDDEN',
      message: 'Tu usuario no tiene permisos de administrador.',
    });

    await expect(loginAction({ email: 'user@example.com', password: 'secret' })).resolves.toEqual({
      ok: false,
      code: 'FORBIDDEN',
      error: 'Tu usuario no tiene permisos de administrador.',
    });
  });
});

describe('clearStaleSessionAction', () => {
  it('clears the stored session without logging out through the provider', async () => {
    await clearStaleSessionAction();

    expect(mocks.clearSession).toHaveBeenCalledTimes(1);
    expect(mocks.logout).not.toHaveBeenCalled();
  });
});
