import type { SiteSettings } from '@/lib/siteSettings';

export function heroPositioningKicker(settings: Pick<SiteSettings, 'experience'>): string {
  return `${settings.experience} años en Barranco, Lima`;
}
