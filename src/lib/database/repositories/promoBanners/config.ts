import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type { OrderableCollectionConfig } from '@/lib/database/orderableCollection/types';
import type { DocumentRecord } from '@/lib/database/types';

import type { PromoBanner, PromoBannerWritePayload } from './types';

interface PromoBannerDocument extends DocumentRecord {
  content_position: 'top' | 'bottom';
  cta_external: boolean;
  cta_href: string;
  cta_label: string;
  description: string;
  display_order: number;
  ends_at: string | null;
  image_url: string;
  is_active: boolean;
  name: string | null;
  starts_at: string | null;
  title: string;
}

function toRow(doc: DocumentRecord & Record<string, unknown>): PromoBanner {
  const record = doc as unknown as PromoBannerDocument;
  return {
    id: record.id,
    contentPosition: record.content_position,
    ctaExternal: record.cta_external,
    ctaHref: record.cta_href,
    ctaLabel: record.cta_label,
    description: record.description,
    displayOrder: record.display_order,
    endsAt: record.ends_at,
    imageUrl: record.image_url,
    isActive: record.is_active,
    name: record.name,
    startsAt: record.starts_at,
    title: record.title,
  };
}

function toDocumentData(payload: PromoBannerWritePayload): Record<string, unknown> {
  return {
    content_position: payload.contentPosition,
    cta_external: payload.ctaExternal,
    cta_href: payload.ctaHref,
    cta_label: payload.ctaLabel,
    description: payload.description,
    display_order: payload.displayOrder,
    ends_at: payload.endsAt,
    image_url: payload.imageUrl,
    is_active: payload.isActive,
    name: payload.name,
    starts_at: payload.startsAt,
    title: payload.title,
  };
}

export const promoBannerConfig: OrderableCollectionConfig<PromoBanner, PromoBannerWritePayload> = {
  collectionId: APPWRITE_COLLECTIONS.promoBanners,
  assetUrlField: 'imageUrl',
  toRow,
  toDocumentData,
};
