const WEB_PROTOCOLS = new Set(['http:', 'https:']);

export function normalizeSiteOrigin(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (!WEB_PROTOCOLS.has(url.protocol) || !url.hostname) return null;
  url.protocol = 'https:';
  return url.origin;
}
