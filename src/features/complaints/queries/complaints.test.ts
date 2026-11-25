import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthError } from '@/lib/auth/errors';

import { getComplaintById, getComplaints } from './complaints';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  complaintsRepository: {
    list: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock('@/lib/auth', async () => {
  const errors = await vi.importActual<typeof import('@/lib/auth/errors')>('@/lib/auth/errors');
  return {
    auth: { requireAdmin: mocks.requireAdmin },
    AuthError: errors.AuthError,
  };
});

vi.mock('@/lib/database/repositories/complaints', () => ({
  complaintsRepository: mocks.complaintsRepository,
}));

const queries: [string, () => Promise<unknown>][] = [
  ['getComplaints', () => getComplaints()],
  ['getComplaintById', () => getComplaintById('complaint-1')],
];

const authFailures = [
  new AuthError('UNAUTHENTICATED', 'No active session'),
  new AuthError('FORBIDDEN', 'Not an admin'),
];

describe('complaint queries authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  for (const failure of authFailures) {
    describe(`when requireAdmin rejects with ${failure.code}`, () => {
      it.each(queries)('%s rejects without touching the repository', async (_name, run) => {
        mocks.requireAdmin.mockRejectedValue(failure);

        await expect(run()).rejects.toBeInstanceOf(AuthError);
        await expect(run()).rejects.toMatchObject({ code: failure.code });

        expect(mocks.requireAdmin).toHaveBeenCalled();
        expect(mocks.complaintsRepository.list).not.toHaveBeenCalled();
        expect(mocks.complaintsRepository.findById).not.toHaveBeenCalled();
      });
    });
  }

  it('passes the complaint through for an admin', async () => {
    const complaint = { id: 'complaint-1' };
    mocks.requireAdmin.mockResolvedValue({ id: 'admin-1' });
    mocks.complaintsRepository.findById.mockResolvedValue(complaint);

    await expect(getComplaintById('complaint-1')).resolves.toBe(complaint);

    expect(mocks.requireAdmin).toHaveBeenCalledTimes(1);
    expect(mocks.complaintsRepository.findById).toHaveBeenCalledWith('complaint-1');
  });
});
