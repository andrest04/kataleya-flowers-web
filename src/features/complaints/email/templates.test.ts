import { describe, expect, it } from 'vitest';

import {
  businessNotificationEmail,
  type ComplaintEmailData,
  type ComplaintProvider,
  consumerCopyEmail,
} from './templates';

const HOSTILE = '<img src=x onerror="alert(1)">';

const PROVIDER: ComplaintProvider = {
  address: 'Av. Primavera 123, Lima',
  name: 'Kataleya Flowers',
  razonSocial: 'Kataleya Flowers S.A.C.',
  ruc: '20123456789',
  website: 'https://kataleyaflowers.pe',
};

function emailData(overrides: Partial<ComplaintEmailData> = {}): ComplaintEmailData {
  return {
    complaintNumber: '00007-2026',
    createdAt: '2026-06-01T15:00:00Z',
    consumerName: 'Ana Torres',
    consumerDocType: 'DNI',
    consumerDocNumber: '12345678',
    consumerAddress: 'Av. Siempre Viva 742',
    consumerPhone: '987654321',
    consumerEmail: 'ana@example.com',
    isMinor: false,
    guardianName: '',
    itemType: 'PRODUCTO',
    itemDescription: 'Ramo de rosas',
    complaintType: 'RECLAMO',
    detail: 'Llegó marchito.',
    consumerRequest: 'Reembolso.',
    ...overrides,
  };
}

function hasControlCharacters(value: string): boolean {
  return [...value].some((char) => {
    const code = char.charCodeAt(0);
    return code < 0x20 || code === 0x7f;
  });
}

describe('businessNotificationEmail', () => {
  it('builds the admin link from the website origin only', () => {
    const { html } = businessNotificationEmail(emailData(), 'complaint-1', {
      ...PROVIDER,
      website: 'https://kataleyaflowers.pe/path"><script>alert(1)</script>',
    });

    expect(html).toContain('href="https://kataleyaflowers.pe/admin/reclamos/complaint-1"');
    expect(html).not.toContain('"><script>');
    expect(html).not.toContain('<script>');
  });

  it('omits the admin link when the website is not an http(s) URL', () => {
    for (const website of ['javascript:alert(1)', 'not a url', '<b>"x"</b>']) {
      const { html } = businessNotificationEmail(emailData(), 'complaint-1', { ...PROVIDER, website });

      expect(html).not.toContain('href=');
      expect(html).not.toContain('javascript:');
      expect(html).not.toContain('<b>');
    }
  });

  it('escapes every consumer free-text field', () => {
    const { html } = businessNotificationEmail(
      emailData({
        consumerName: HOSTILE,
        consumerDocNumber: HOSTILE,
        consumerAddress: HOSTILE,
        consumerPhone: HOSTILE,
        consumerEmail: HOSTILE,
        isMinor: true,
        guardianName: HOSTILE,
        itemDescription: HOSTILE,
        detail: HOSTILE,
        consumerRequest: HOSTILE,
      }),
      'complaint-1',
      PROVIDER,
    );

    expect(html).not.toContain(HOSTILE);
    expect(html).not.toContain('<img');
    expect(html.split('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;')).toHaveLength(10);
  });

  it('strips control characters from the subject and caps the provider name', () => {
    const { subject } = businessNotificationEmail(emailData(), 'complaint-1', {
      ...PROVIDER,
      name: `Kataleya\r\nBcc: attacker@example.com${'x'.repeat(300)}`,
    });

    expect(hasControlCharacters(subject)).toBe(false);
  });
});

describe('consumerCopyEmail', () => {
  it('strips control characters from the subject and caps the provider name', () => {
    const name = `Kataleya\r\nBcc: attacker@example.com\u0000${'x'.repeat(300)}`;
    const { subject } = consumerCopyEmail(emailData(), { ...PROVIDER, name });

    expect(hasControlCharacters(subject)).toBe(false);
    expect(subject).toContain('KataleyaBcc: attacker@example.com');
    const prefix = 'Tu hoja de reclamación N° 00007-2026 — ';
    expect(subject.startsWith(prefix)).toBe(true);
    expect(subject.length - prefix.length).toBe(120);
  });

  it('escapes the provider name in the HTML body', () => {
    const { html } = consumerCopyEmail(emailData(), { ...PROVIDER, name: HOSTILE });

    expect(html).not.toContain(HOSTILE);
  });
});
