import { BUSINESS } from '@/lib/constants';

export const PASSWORD_RESET_PATH = '/restablecer-contrasena';

const ALLOWED_PROTOCOLS = new Set(['https:', 'http:']);

function httpOrigin(value: string | undefined): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    return ALLOWED_PROTOCOLS.has(url.protocol) ? url.origin : null;
  } catch {
    return null;
  }
}

export function buildRecoveryUrl(siteUrl: string | undefined = process.env.SITE_URL): string {
  const origin = httpOrigin(siteUrl) ?? new URL(BUSINESS.website).origin;
  return `${origin}${PASSWORD_RESET_PATH}`;
}
