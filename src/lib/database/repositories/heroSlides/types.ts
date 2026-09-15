import type { OrderableRecord } from '@/lib/database/orderableCollection/types';

export type HeroCtaType = 'whatsapp' | 'catalogo' | 'url';

export interface HeroSlide extends OrderableRecord {
  altText: string;
  ctaLabel: string | null;
  ctaType: HeroCtaType;
  ctaValue: string | null;
  endsAt: string | null;
  focus: string | null;
  imageUrl: string;
  kicker: string;
  name: string | null;
  startsAt: string | null;
  subtitle: string | null;
  title: string;
}

export interface HeroSlideWritePayload {
  altText: string;
  ctaLabel: string | null;
  ctaType: HeroCtaType;
  ctaValue: string | null;
  displayOrder: number;
  endsAt: string | null;
  focus: string | null;
  imageUrl: string;
  isActive: boolean;
  kicker: string;
  name: string;
  startsAt: string | null;
  subtitle: string | null;
  title: string;
}
