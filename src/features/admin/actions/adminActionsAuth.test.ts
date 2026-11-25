import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthError } from '@/lib/auth/errors';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  forbiddenCalls: [] as string[],
}));

vi.mock('@/lib/auth', async () => {
  const errors = await import('@/lib/auth/errors');
  return { AuthError: errors.AuthError, auth: { requireAdmin: mocks.requireAdmin } };
});

vi.mock('next/cache', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const forbid = (name: string) => () => {
    mocks.forbiddenCalls.push(`next/cache.${name}`);
    throw new Error(`next/cache.${name} must not run without an admin`);
  };
  return {
    ...actual,
    revalidatePath: forbid('revalidatePath'),
    revalidateTag: forbid('revalidateTag'),
    updateTag: forbid('updateTag'),
  };
});

const actionsDir = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(actionsDir, '../../..');

function trap(name: string, value: unknown): unknown {
  if (typeof value === 'function') {
    return () => {
      mocks.forbiddenCalls.push(name);
      throw new Error(`${name} must not run without an admin`);
    };
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return new Proxy(value, {
      get(target, prop, receiver) {
        const member: unknown = Reflect.get(target, prop, receiver);
        return typeof member === 'function' ? trap(`${name}.${String(prop)}`, member) : member;
      },
    });
  }
  return value;
}

const repositoryModules = readdirSync(path.join(srcDir, 'lib/database/repositories'), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => `@/lib/database/repositories/${entry.name}`);

const trappedModules = [
  ...repositoryModules,
  '@/lib/imageStorage',
  '@/lib/mapsShortLink',
  '@/features/settings/queries/getSiteSettings',
  '@/features/landing/queries/getPublishedDiscoverTiles',
  '@/features/landing/queries/getPublishedTestimonials',
  '@/features/landing/queries/getPublishedValueProps',
];

for (const specifier of trappedModules) {
  vi.doMock(specifier, async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return Object.fromEntries(
      Object.entries(actual).map(([key, value]) => [key, trap(`${specifier}.${key}`, value)]),
    );
  });
}

const isServerActionModule = (file: string): boolean =>
  /^['"]use server['"]/.test(readFileSync(file, 'utf8').trimStart());

const adminActionFiles = readdirSync(actionsDir)
  .filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts') && name !== 'auth.ts')
  .map((name) => path.join(actionsDir, name))
  .filter(isServerActionModule);

const actionFiles = [
  ...adminActionFiles,
  path.join(srcDir, 'features/complaints/actions/updateComplaint.ts'),
];

type ServerAction = (...args: unknown[]) => Promise<unknown>;

const actionModules = await Promise.all(
  actionFiles.map(async (file) => {
    const loaded = (await import(file)) as Record<string, unknown>;
    const actions = Object.entries(loaded).filter(
      (entry): entry is [string, ServerAction] => typeof entry[1] === 'function',
    );
    return { name: path.relative(srcDir, file).replaceAll('\\', '/'), actions };
  }),
);

const cases = actionModules.flatMap(({ name, actions }) =>
  actions.map(([exportName, action]): [string, ServerAction] => [`${name}#${exportName}`, action]),
);

const authFailures = ['UNAUTHENTICATED', 'FORBIDDEN'] as const;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.forbiddenCalls.length = 0;
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('admin server actions auth guard', () => {
  it('discovers every admin server action module plus updateComplaint', () => {
    expect(adminActionFiles.length).toBeGreaterThan(0);
    expect(actionFiles.map((file) => path.basename(file))).toContain('updateComplaint.ts');
    expect(actionFiles.map((file) => path.basename(file))).not.toContain('auth.ts');
    for (const { name, actions } of actionModules) {
      expect(actions.length, `${name} exports no server action`).toBeGreaterThan(0);
    }
  });

  describe.each(authFailures)('when requireAdmin throws %s', (code) => {
    it.each(cases)('%s returns the auth failure and touches no data layer', async (_label, action) => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mocks.requireAdmin.mockRejectedValue(new AuthError(code, `auth failed: ${code}`));

      const result = await action();

      expect(result).toMatchObject({ success: false, code });
      expect(mocks.requireAdmin).toHaveBeenCalled();
      expect(mocks.forbiddenCalls).toEqual([]);
    });
  });
});
