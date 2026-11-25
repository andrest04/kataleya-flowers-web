import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const counts = new Map<string, number>();
  return {
    counts,
    checkBotId: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    clearSession: vi.fn(),
    requestPasswordRecovery: vi.fn(),
    completePasswordRecovery: vi.fn(),
    afterTasks: [] as (() => unknown)[],
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

vi.mock('next/server', () => ({
  after: (task: () => unknown) => {
    mocks.afterTasks.push(task);
  },
}));

vi.mock('@/lib/rateLimit', () => ({
  rateLimiter: { hit: mocks.hit },
  clientKeyFromHeaders: mocks.clientKey,
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    login: mocks.login,
    logout: mocks.logout,
    clearSession: mocks.clearSession,
    requestPasswordRecovery: mocks.requestPasswordRecovery,
    completePasswordRecovery: mocks.completePasswordRecovery,
  },
}));

const { clearStaleSessionAction, loginAction, requestPasswordRecoveryAction, resetPasswordAction } =
  await import('./auth');

async function runAfterTasks() {
  const tasks = mocks.afterTasks.splice(0);
  for (const task of tasks) await task();
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.counts.clear();
  mocks.afterTasks.length = 0;
  mocks.requestPasswordRecovery.mockResolvedValue(undefined);
  mocks.completePasswordRecovery.mockResolvedValue({ ok: true });
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

describe('requestPasswordRecoveryAction', () => {
  const HOUR_MS = 60 * 60 * 1000;

  it('returns the generic success and schedules the request with a server-built url', async () => {
    const previous = process.env.SITE_URL;
    delete process.env.SITE_URL;
    try {
      await expect(requestPasswordRecoveryAction({ email: '  Admin@Example.com ' })).resolves.toEqual({
        ok: true,
      });
      await runAfterTasks();
    } finally {
      if (previous !== undefined) process.env.SITE_URL = previous;
    }

    expect(mocks.requestPasswordRecovery).toHaveBeenCalledWith(
      'admin@example.com',
      'https://www.kataleyaflowers.com/restablecer-contrasena',
    );
  });

  it('returns the same success whatever the provider does with the email', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.requestPasswordRecovery.mockRejectedValueOnce(new Error('should never reach the caller'));

    const unknown = await requestPasswordRecoveryAction({ email: 'nobody@example.com' });
    const admin = await requestPasswordRecoveryAction({ email: 'admin@example.com' });

    expect(unknown).toEqual(admin);
    await expect(runAfterTasks()).resolves.toBeUndefined();
  });

  it('returns VALIDATION with an email field error for a malformed email', async () => {
    const result = await requestPasswordRecoveryAction({ email: 'not-an-email' });

    expect(result).toMatchObject({
      ok: false,
      code: 'VALIDATION',
      fieldErrors: { email: expect.any(String) },
    });
    expect(mocks.hit).not.toHaveBeenCalled();
    expect(mocks.afterTasks).toHaveLength(0);
  });

  it('limits each email to 3 requests per hour across letter case', async () => {
    for (const email of ['admin@example.com', 'ADMIN@example.com', 'Admin@Example.com']) {
      await expect(requestPasswordRecoveryAction({ email })).resolves.toEqual({ ok: true });
    }

    const fourth = await requestPasswordRecoveryAction({ email: 'admin@example.com' });

    expect(fourth).toMatchObject({ ok: false, code: 'RATE_LIMITED' });
    expect(mocks.afterTasks).toHaveLength(3);
    expect(mocks.hit).toHaveBeenCalledWith('recovery-email', 'admin@example.com', {
      limit: 3,
      windowMs: HOUR_MS,
    });
  });

  it('limits each client to 10 requests per hour across emails', async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await requestPasswordRecoveryAction({ email: `user${attempt}@example.com` });
    }

    const result = await requestPasswordRecoveryAction({ email: 'other@example.com' });

    expect(result).toMatchObject({ ok: false, code: 'RATE_LIMITED' });
    expect(mocks.afterTasks).toHaveLength(10);
    expect(mocks.hit).toHaveBeenCalledWith('recovery-ip', '203.0.113.7', {
      limit: 10,
      windowMs: HOUR_MS,
    });
  });

  it('fails closed with INTERNAL when the limiter store is unavailable', async () => {
    vi.spyOn(console, 'error').mockImplementationOnce(() => undefined);
    mocks.hit.mockRejectedValueOnce(new Error('rate_limits collection missing'));

    const result = await requestPasswordRecoveryAction({ email: 'admin@example.com' });

    expect(result).toMatchObject({ ok: false, code: 'INTERNAL' });
    expect(mocks.afterTasks).toHaveLength(0);
  });

  it('returns INTERNAL before the limiter runs when BotID flags the request', async () => {
    mocks.checkBotId.mockResolvedValueOnce({ isBot: true });

    const result = await requestPasswordRecoveryAction({ email: 'admin@example.com' });

    expect(result).toMatchObject({ ok: false, code: 'INTERNAL' });
    expect(mocks.hit).not.toHaveBeenCalled();
    expect(mocks.afterTasks).toHaveLength(0);
  });
});

describe('resetPasswordAction', () => {
  const validInput = {
    userId: 'user-1',
    secret: 'secret-1',
    password: 'Tq8$wz!Kp3vX',
    confirmPassword: 'Tq8$wz!Kp3vX',
  };

  it('completes the recovery and returns ok', async () => {
    await expect(resetPasswordAction(validInput)).resolves.toEqual({ ok: true });

    expect(mocks.completePasswordRecovery).toHaveBeenCalledWith(
      'user-1',
      'secret-1',
      'Tq8$wz!Kp3vX',
    );
  });

  it('returns VALIDATION on confirmPassword when the passwords differ', async () => {
    const result = await resetPasswordAction({
      ...validInput,
      confirmPassword: 'Tq8$wz!Kp3vY',
    });

    expect(result).toMatchObject({
      ok: false,
      code: 'VALIDATION',
      fieldErrors: { confirmPassword: expect.any(String) },
    });
    expect(result).not.toHaveProperty('fieldErrors.password');
    expect(mocks.completePasswordRecovery).not.toHaveBeenCalled();
  });

  it.each([
    ['shorter than 8 characters', 'Shrt-1!'],
    ['missing an uppercase letter', 'new-passw0rd'],
    ['missing a number', 'New-password'],
    ['missing a special character', 'NewPassw0rd'],
    ['easy to guess', 'Password1!'],
    ['longer than 256 characters', `Aa1!${'x'.repeat(253)}`],
  ])('returns VALIDATION on password when it is %s', async (_label, password) => {
    const result = await resetPasswordAction({ ...validInput, password, confirmPassword: password });

    expect(result).toMatchObject({
      ok: false,
      code: 'VALIDATION',
      fieldErrors: { password: expect.any(String) },
    });
    expect(mocks.hit).not.toHaveBeenCalled();
    expect(mocks.completePasswordRecovery).not.toHaveBeenCalled();
  });

  it.each([
    ['an empty userId', { userId: '' }],
    ['an empty secret', { secret: '' }],
    ['a malformed userId', { userId: '../user' }],
    ['an oversized secret', { secret: 's'.repeat(2049) }],
  ])('returns INVALID_LINK for %s', async (_label, override) => {
    const result = await resetPasswordAction({ ...validInput, ...override });

    expect(result).toMatchObject({ ok: false, code: 'INVALID_LINK' });
    expect(mocks.completePasswordRecovery).not.toHaveBeenCalled();
  });

  it.each(['INVALID_LINK', 'WEAK_PASSWORD'] as const)(
    'propagates %s from the auth service',
    async (code) => {
      mocks.completePasswordRecovery.mockResolvedValueOnce({ ok: false, code, message: 'mensaje' });

      await expect(resetPasswordAction(validInput)).resolves.toEqual({
        ok: false,
        code,
        error: 'mensaje',
      });
    },
  );

  it('limits each client to 10 attempts per 15 minutes', async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await resetPasswordAction(validInput);
    }

    const result = await resetPasswordAction(validInput);

    expect(result).toMatchObject({ ok: false, code: 'RATE_LIMITED' });
    expect(mocks.completePasswordRecovery).toHaveBeenCalledTimes(10);
    expect(mocks.hit).toHaveBeenCalledWith('reset-ip', '203.0.113.7', {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
  });

  it('fails closed with INTERNAL when the limiter store is unavailable', async () => {
    vi.spyOn(console, 'error').mockImplementationOnce(() => undefined);
    mocks.hit.mockRejectedValueOnce(new Error('rate_limits collection missing'));

    const result = await resetPasswordAction(validInput);

    expect(result).toMatchObject({ ok: false, code: 'INTERNAL' });
    expect(mocks.completePasswordRecovery).not.toHaveBeenCalled();
  });

  it('returns INTERNAL before the limiter runs when BotID flags the request', async () => {
    mocks.checkBotId.mockResolvedValueOnce({ isBot: true });

    const result = await resetPasswordAction(validInput);

    expect(result).toMatchObject({ ok: false, code: 'INTERNAL' });
    expect(mocks.hit).not.toHaveBeenCalled();
    expect(mocks.completePasswordRecovery).not.toHaveBeenCalled();
  });
});
