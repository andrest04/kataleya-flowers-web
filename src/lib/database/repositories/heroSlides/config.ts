import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type { OrderableCollectionConfig } from '@/lib/database/orderableCollection/types';
import type { DocumentRecord } from '@/lib/database/types';

import type { HeroCtaType, HeroSlide, HeroSlideWritePayload } from './types';

interface HeroSlideDocument extends DocumentRecord {
  alt_text: string;
  cta_label: string | null;
  cta_type: HeroCtaType;
  cta_value: string | null;
  display_order: number;
  ends_at: string | null;
  focus: string | null;
  image_url: string;
  is_active: boolean;
  kicker: string;
  name: string | null;
  starts_at: string | null;
  subtitle: string | null;
  title: string;
}

function toRow(doc: DocumentRecord & Record<string, unknown>): HeroSlide {
  const record = doc as unknown as HeroSlideDocument;
  return {
    id: record.id,
    altText: record.alt_text,
    ctaLabel: record.cta_label,
    ctaType: record.cta_type,
    ctaValue: record.cta_value,
    displayOrder: record.display_order,
    endsAt: record.ends_at,
    focus: record.focus,
    imageUrl: record.image_url,
    isActive: record.is_active,
    kicker: record.kicker,
    name: record.name,
    startsAt: record.starts_at,
    subtitle: record.subtitle,
    title: record.title,
  };
}

function toDocumentData(payload: HeroSlideWritePayload): Record<string, unknown> {
  return {
    alt_text: payload.altText,
    cta_label: payload.ctaLabel,
    cta_type: payload.ctaType,
    cta_value: payload.ctaValue,
    display_order: payload.displayOrder,
    ends_at: payload.endsAt,
    focus: payload.focus,
    image_url: payload.imageUrl,
    is_active: payload.isActive,
    kicker: payload.kicker,
    name: payload.name,
    starts_at: payload.startsAt,
    subtitle: payload.subtitle,
    title: payload.title,
  };
}

export const heroSlideConfig: OrderableCollectionConfig<HeroSlide, HeroSlideWritePayload> = {
  collectionId: APPWRITE_COLLECTIONS.heroSlides,
  assetUrlField: 'imageUrl',
  toRow,
  toDocumentData,
};
