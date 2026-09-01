const MAX_EMBED_URL_LENGTH = 2048;
const AT_COORDS = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,(\d+(?:\.\d+)?)z)?/;
const IFRAME_SRC =
  /<iframe\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
const PLACE_PATH = /\/maps\/place\/([^/?#]+)/;
const SEARCH_PATH = /\/maps\/search\/([^/?#]+)/;

export function isMapsShortLinkHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === 'maps.app.goo.gl' || host === 'goo.gl';
}

export function isAllowedMapsHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (isMapsShortLinkHost(host)) return true;
  if (host === 'google.com' || host.endsWith('.google.com')) return true;
  if (/^(?:www\.|maps\.)?google\.com(?:\.[a-z]{2,3})?$/.test(host)) return true;
  if (/^(?:www\.|maps\.)?google\.co\.[a-z]{2}$/.test(host)) return true;
  return false;
}

export function extractMapsCandidate(raw: string): string {
  const trimmed = raw.trim();
  if (!/<iframe/i.test(trimmed)) return trimmed;
  const match = trimmed.match(IFRAME_SRC);
  const src = match?.[1] ?? match?.[2] ?? match?.[3];
  return src?.trim() || trimmed;
}

function coerceHttpsUrl(value: string): URL | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
  try {
    const url = new URL(withProtocol);
    if (url.username || url.password) return null;
    if (url.protocol === 'https:') return url;
    if (url.protocol === 'http:') {
      url.protocol = 'https:';
      return url;
    }
    return null;
  } catch {
    return null;
  }
}

function decodePlaceName(value: string): string | null {
  try {
    const decoded = decodeURIComponent(value.replace(/\+/g, ' ')).trim();
    return decoded || null;
  } catch {
    return null;
  }
}

function isValidCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat)
    && Number.isFinite(lng)
    && lat >= -90
    && lat <= 90
    && lng >= -180
    && lng <= 180
  );
}

function parseZoom(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const zoom = Number(value);
  if (!Number.isFinite(zoom) || zoom <= 0) return undefined;
  return String(Math.round(zoom));
}

function embedFromQuery(query: string, zoom?: string): string {
  const params = new URLSearchParams();
  params.set('q', query);
  if (zoom) params.set('z', zoom);
  params.set('output', 'embed');
  return `https://www.google.com/maps?${params.toString()}`;
}

function embedFromCoords(lat: string, lng: string, zoom?: string): string | null {
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (!isValidCoord(latNum, lngNum)) return null;
  return embedFromQuery(`${lat},${lng}`, zoom);
}

function capEmbedUrl(href: string): string | null {
  return href.length <= MAX_EMBED_URL_LENGTH ? href : null;
}

export function toMapsEmbedUrl(raw: string): string | null {
  const candidate = extractMapsCandidate(raw);
  const url = coerceHttpsUrl(candidate);
  if (!url) return null;
  if (!isAllowedMapsHost(url.hostname)) return null;
  if (isMapsShortLinkHost(url.hostname)) return null;

  const pathname = url.pathname;
  const alreadyEmbed =
    pathname === '/maps/embed'
    || pathname.startsWith('/maps/embed/')
    || url.searchParams.get('output') === 'embed';
  if (alreadyEmbed) return capEmbedUrl(url.href);

  const at = pathname.match(AT_COORDS) ?? url.href.match(AT_COORDS);
  if (at) {
    const embed = embedFromCoords(at[1], at[2], parseZoom(at[3]));
    return embed ? capEmbedUrl(embed) : null;
  }

  const ll = url.searchParams.get('ll');
  if (ll) {
    const [lat, lng] = ll.split(',');
    if (lat && lng) {
      const embed = embedFromCoords(lat, lng, parseZoom(url.searchParams.get('z')));
      return embed ? capEmbedUrl(embed) : null;
    }
  }

  const query = url.searchParams.get('q') ?? url.searchParams.get('query');
  if (query?.trim()) {
    return capEmbedUrl(embedFromQuery(query.trim(), parseZoom(url.searchParams.get('z'))));
  }

  const place = pathname.match(PLACE_PATH);
  if (place) {
    const name = decodePlaceName(place[1]);
    return name ? capEmbedUrl(embedFromQuery(name)) : null;
  }

  const search = pathname.match(SEARCH_PATH);
  if (search) {
    const name = decodePlaceName(search[1]);
    return name ? capEmbedUrl(embedFromQuery(name)) : null;
  }

  return null;
}
