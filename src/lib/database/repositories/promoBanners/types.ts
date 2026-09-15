import type { OrderableRecord } from '@/lib/database/orderableCollection/types';

export interface PromoBanner extends OrderableRecord {
  contentPosition: 'top' | 'bottom';
  ctaExternal: boolean;
  ctaHref: string;
  ctaLabel: string;
  description: string;
  endsAt: string | null;
  imageUrl: string;
  name: string | null;
  startsAt: string | null;
  title: string;
}

export interface PromoBannerWritePayload {
  contentPosition: 'top' | 'bottom';
  ctaExternal: boolean;
  ctaHref: string;
  ctaLabel: string;
  description: string;
  displayOrder: number;
  endsAt: string | null;
  imageUrl: string;
  isActive: boolean;
  name: string;
  startsAt: string | null;
  title: string;
}
