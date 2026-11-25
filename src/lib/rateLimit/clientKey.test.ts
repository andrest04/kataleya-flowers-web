import { describe, expect, it } from 'vitest';

import { clientKeyFromHeaders } from './clientKey';

function keyFor(values: Record<string, string>): string {
  return clientKeyFromHeaders(new Headers(values));
}

describe('clientKeyFromHeaders', () => {
  it('keys an x-forwarded-for chain on its first hop', () => {
    expect(keyFor({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1, 10.0.0.2' })).toBe('203.0.113.7');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    expect(keyFor({ 'x-real-ip': ' 198.51.100.4 ' })).toBe('198.51.100.4');
  });

  it('returns a shared unknown key when no client address header is present', () => {
    expect(keyFor({})).toBe('unknown');
  });

  it('strips a port from an IPv4 address', () => {
    expect(keyFor({ 'x-forwarded-for': '203.0.113.7:51234' })).toBe('203.0.113.7');
  });

  it('maps twelve addresses inside one IPv6 /64 to one key', () => {
    const addresses = Array.from(
      { length: 12 },
      (_, index) => `2001:db8:abcd:12:${(index + 1).toString(16)}:ffff:${index}:1`,
    );

    const keys = new Set(addresses.map((address) => keyFor({ 'x-forwarded-for': address })));

    expect(keys).toEqual(new Set(['2001:db8:abcd:12::/64']));
  });

  it('treats compressed, expanded and bracketed spellings of the same /64 as one key', () => {
    const compressed = keyFor({ 'x-forwarded-for': '2001:DB8::1' });

    expect(compressed).toBe('2001:db8:0:0::/64');
    expect(keyFor({ 'x-forwarded-for': '2001:0db8:0000:0000:ffff:0:0:2' })).toBe(compressed);
    expect(keyFor({ 'x-forwarded-for': '[2001:db8::3]:443' })).toBe(compressed);
  });

  it('keeps different IPv6 /64 networks apart', () => {
    expect(keyFor({ 'x-forwarded-for': '2001:db8:abcd:12::1' })).not.toBe(
      keyFor({ 'x-forwarded-for': '2001:db8:abcd:13::1' }),
    );
  });

  it('unwraps an IPv4-mapped IPv6 address to its IPv4 form', () => {
    expect(keyFor({ 'x-forwarded-for': '::ffff:203.0.113.7' })).toBe('203.0.113.7');
  });
});
