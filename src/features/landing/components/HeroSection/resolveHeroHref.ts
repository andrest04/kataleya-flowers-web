import { defaultWhatsappHref, type SiteSettings } from '@/lib/siteSettings';

export function resolveHeroHref(
  href: string,
  settings: Pick<SiteSettings, 'messages' | 'phone' | 'whatsapp'>,
): string {
  return href === settings.whatsapp ? defaultWhatsappHref(settings) : href;
}
