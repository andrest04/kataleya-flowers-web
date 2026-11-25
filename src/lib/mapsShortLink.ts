import { isAllowedMapsHost } from './mapsEmbed';

export type MapsShortLinkFetch = (input: string, init: RequestInit) => Promise<Response>;

const MAX_REDIRECT_HOPS = 5;
const RESOLVE_TIMEOUT_MS = 5000;

function isRedirectStatus(status: number): boolean {
  return status >= 300 && status < 400;
}

function isAllowedTarget(url: URL): boolean {
  return (
    url.protocol === 'https:'
    && !url.username
    && !url.password
    && isAllowedMapsHost(url.hostname)
  );
}

function redirectTarget(location: string | null, current: URL): URL | null {
  if (!location) return null;
  try {
    const next = new URL(location, current);
    return isAllowedTarget(next) ? next : null;
  } catch {
    return null;
  }
}

async function discardBody(response: Response): Promise<void> {
  await response.body?.cancel().catch(() => undefined);
}

export async function followMapsShortLink(
  start: URL,
  fetcher: MapsShortLinkFetch = fetch,
): Promise<string | null> {
  if (!isAllowedTarget(start)) return null;
  const signal = AbortSignal.timeout(RESOLVE_TIMEOUT_MS);
  let current = start;
  try {
    for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop += 1) {
      const response = await fetcher(current.href, { cache: 'no-store', redirect: 'manual', signal });
      await discardBody(response);
      if (!isRedirectStatus(response.status)) return current.href;
      if (hop === MAX_REDIRECT_HOPS) return null;
      const next = redirectTarget(response.headers.get('location'), current);
      if (!next) return null;
      current = next;
    }
    return null;
  } catch {
    return null;
  }
}
