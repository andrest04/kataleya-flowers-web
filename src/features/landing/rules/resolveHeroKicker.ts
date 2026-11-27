import type { SiteSettings } from '@/lib/siteSettings';

import { heroPositioningKicker } from './heroPositioning';

export function resolveHeroKicker(
  slideKicker: string | undefined,
  settings: Pick<SiteSettings, 'experience'>,
): string {
  const trimmed = slideKicker?.trim();
  return trimmed ? trimmed : heroPositioningKicker(settings);
}
