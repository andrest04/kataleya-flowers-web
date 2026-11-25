import type { HeroCtaType } from '@/lib/database/repositories/heroSlides';

export interface HeroDraft {
  altText: string;
  ctaLabel: string;
  ctaType: HeroCtaType;
  ctaValue: string;
  endsAt: string;
  focus: string;
  imageUrl: string;
  isActive: boolean;
  kicker: string;
  name: string;
  startsAt: string;
  title: string;
}
