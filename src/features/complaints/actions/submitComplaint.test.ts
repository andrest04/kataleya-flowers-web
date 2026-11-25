import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  checkBotId: vi.fn(),
  getClientKey: vi.fn(),
  isComplaintSubmissionAllowed: vi.fn(),
  isConsumerCopyAllowed: vi.fn(),
  sendComplaintEmails: vi.fn(),
  complaintsRepository: {
    allocateCorrelativo: vi.fn(),
    insert: vi.fn(),
    markEmailSent: vi.fn(),
  },
}));

vi.mock('botid/server', () => ({ checkBotId: mocks.checkBotId }));

vi.mock('../utils/rateLimit', () => ({
  getClientKey: mocks.getClientKey,
  isComplaintSubmissionAllowed: mocks.isComplaintSubmissionAllowed,
  isConsumerCopyAllowed: mocks.isConsumerCopyAllowed,
}));

vi.mock('../email/sendComplaintEmails', () => ({
  sendComplaintEmails: mocks.sendComplaintEmails,
}));

vi.mock('@/lib/database/repositories/complaints', () => ({
  complaintsRepository: mocks.complaintsRepository,
}));

const { submitComplaint } = await import('./submitComplaint');

const VALID_INPUT = {
  consumerName: 'Ana Torres',
  consumerDocType: 'DNI',
  consumerDocNumber: '12345678',
  consumerAddress: 'Av. Siempre Viva 742',
  consumerPhone: '',
  consumerEmail: 'ana@example.com',
  isMinor: false,
  guardianName: '',
  itemType: 'PRODUCTO',
  itemDescription: 'Ramo de rosas rojas',
  complaintType: 'RECLAMO',
  detail: 'El ramo llegó con las flores marchitas.',
  consumerRequest: 'Solicito el reembolso del pedido.',
};

const CREATED_AT = '2027-01-01T04:30:01.000Z';

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2027-01-01T04:30:00Z'));
  mocks.checkBotId.mockResolvedValue({ isBot: false });
  mocks.getClientKey.mockResolvedValue('203.0.113.7');
  mocks.isComplaintSubmissionAllowed.mockResolvedValue(true);
  mocks.isConsumerCopyAllowed.mockResolvedValue(true);
  mocks.complaintsRepository.allocateCorrelativo.mockResolvedValue(7);
  mocks.complaintsRepository.insert.mockImplementation(
    async (input: { correlativo: number; correlativoYear: number }) => ({
      id: 'complaint-1',
      correlativo: input.correlativo,
      correlativoYear: input.correlativoYear,
      createdAt: CREATED_AT,
    }),
  );
  mocks.complaintsRepository.markEmailSent.mockResolvedValue(undefined);
  mocks.sendComplaintEmails.mockResolvedValue(true);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('submitComplaint', () => {
  it('allocates and persists the same Lima year', async () => {
    const result = await submitComplaint(VALID_INPUT);

    expect(mocks.complaintsRepository.allocateCorrelativo).toHaveBeenCalledWith(2026);
    expect(mocks.complaintsRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({ correlativo: 7, correlativoYear: 2026 }),
    );
    expect(result).toMatchObject({ success: true, complaintNumber: '00007-2026' });
  });

  it('stays successful with emailSent false when sending throws after the insert', async () => {
    mocks.sendComplaintEmails.mockRejectedValueOnce(new Error('settings unavailable'));

    const result = await submitComplaint(VALID_INPUT);

    expect(mocks.complaintsRepository.insert).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: true,
      complaintNumber: '00007-2026',
      createdAt: CREATED_AT,
      emailSent: false,
    });
    expect(mocks.complaintsRepository.markEmailSent).not.toHaveBeenCalled();
  });

  it('stays successful when the consumer copy check throws after the insert', async () => {
    mocks.isConsumerCopyAllowed.mockRejectedValueOnce(new Error('limiter down'));

    const result = await submitComplaint(VALID_INPUT);

    expect(result).toMatchObject({ success: true, emailSent: false });
  });

  it('marks the complaint as emailed after a successful send', async () => {
    const result = await submitComplaint(VALID_INPUT);

    expect(result).toMatchObject({ success: true, emailSent: true });
    expect(mocks.complaintsRepository.markEmailSent).toHaveBeenCalledWith('complaint-1');
  });

  it('does not mark the complaint when the consumer copy was not delivered', async () => {
    mocks.sendComplaintEmails.mockResolvedValueOnce(false);

    const result = await submitComplaint(VALID_INPUT);

    expect(result).toMatchObject({ success: true, emailSent: false });
    expect(mocks.complaintsRepository.markEmailSent).not.toHaveBeenCalled();
  });

  it('keeps emailSent true when persisting the email flag fails', async () => {
    mocks.complaintsRepository.markEmailSent.mockRejectedValueOnce(new Error('update failed'));

    const result = await submitComplaint(VALID_INPUT);

    expect(result).toMatchObject({ success: true, emailSent: true });
  });

  it('returns INTERNAL when the insert fails', async () => {
    mocks.complaintsRepository.insert.mockRejectedValueOnce(new Error('db down'));

    const result = await submitComplaint(VALID_INPUT);

    expect(result).toMatchObject({ success: false, code: 'INTERNAL' });
    expect(mocks.sendComplaintEmails).not.toHaveBeenCalled();
  });

  it('returns VALIDATION issues with only path and message', async () => {
    const result = await submitComplaint({ ...VALID_INPUT, consumerEmail: 'not-an-email' });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.code).toBe('VALIDATION');
    expect(result.issues?.length).toBeGreaterThan(0);
    for (const issue of result.issues ?? []) {
      expect(Object.keys(issue).sort()).toEqual(['message', 'path']);
    }
    expect(result.issues).toContainEqual({ path: ['consumerEmail'], message: expect.any(String) });
    expect(mocks.complaintsRepository.insert).not.toHaveBeenCalled();
  });
});
