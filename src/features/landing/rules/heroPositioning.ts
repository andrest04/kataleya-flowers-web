import type { SiteSettings } from '@/lib/siteSettings';

export const STORE_LOCALITY = 'Barranco, Lima';

export function heroPositioningKicker(settings: Pick<SiteSettings, 'experience'>): string {
  return `${settings.experience} años en ${STORE_LOCALITY}`;
}
