import { describe, expect, it, vi } from 'vitest';

import { followMapsShortLink } from './mapsShortLink';

const START = new URL('https://maps.app.goo.gl/abc123');
const PLACE = 'https://www.google.com/maps/place/Floreria/@-12.13,-77.02,17z';

function redirect(location: string, status = 302): Response {
  return new Response(null, { status, headers: { location } });
}

function fakeFetch(responses: Response[]) {
  const queue = [...responses];
  return vi.fn(async (input: string, init: RequestInit) => {
    void input;
    void init;
    const next = queue.shift();
    if (!next) throw new Error('unexpected fetch');
    return next;
  });
}

describe('followMapsShortLink', () => {
  it('follows allowlisted https redirects manually and returns the final URL', async () => {
    const fetcher = fakeFetch([redirect('https://goo.gl/x', 301), redirect(PLACE), new Response('ok')]);
    await expect(followMapsShortLink(START, fetcher)).resolves.toBe(PLACE);
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher.mock.calls.map(([href]) => href)).toEqual([START.href, 'https://goo.gl/x', PLACE]);
    for (const [, init] of fetcher.mock.calls) {
      expect(init.redirect).toBe('manual');
    }
  });

  it('resolves a relative Location against the current URL', async () => {
    const fetcher = fakeFetch([redirect('/maps/place/Floreria'), new Response('ok')]);
    await expect(followMapsShortLink(START, fetcher)).resolves.toBe(
      'https://maps.app.goo.gl/maps/place/Floreria',
    );
  });

  it('follows at most 5 hops', async () => {
    const hops = Array.from({ length: 6 }, (_, index) => redirect(`https://goo.gl/hop${index}`));
    const fetcher = fakeFetch(hops);
    await expect(followMapsShortLink(START, fetcher)).resolves.toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(6);
  });

  it('accepts exactly 5 hops', async () => {
    const hops = Array.from({ length: 4 }, (_, index) => redirect(`https://goo.gl/hop${index}`));
    const fetcher = fakeFetch([...hops, redirect(PLACE), new Response('ok')]);
    await expect(followMapsShortLink(START, fetcher)).resolves.toBe(PLACE);
  });

  it.each([
    ['http://www.google.com/maps/place/x'],
    ['https://evil.com/maps/place/x'],
    ['https://evil.google.com/maps/place/x'],
    ['https://user:pass@www.google.com/maps'],
    ['javascript:alert(1)'],
  ])('stops at a disallowed Location %s', async (location) => {
    const fetcher = fakeFetch([redirect(location)]);
    await expect(followMapsShortLink(START, fetcher)).resolves.toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('returns null when a redirect has no Location', async () => {
    const fetcher = fakeFetch([new Response(null, { status: 302 })]);
    await expect(followMapsShortLink(START, fetcher)).resolves.toBeNull();
  });

  it('returns null when the request fails', async () => {
    const fetcher = vi.fn(async () => {
      throw new Error('network');
    });
    await expect(followMapsShortLink(START, fetcher)).resolves.toBeNull();
  });

  it('refuses a non-https or non-allowlisted start URL without fetching', async () => {
    const fetcher = fakeFetch([]);
    await expect(followMapsShortLink(new URL('http://maps.app.goo.gl/abc'), fetcher)).resolves.toBeNull();
    await expect(followMapsShortLink(new URL('https://evil.com/abc'), fetcher)).resolves.toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
