import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type { OrderableCollectionConfig } from '@/lib/database/orderableCollection/types';
import type { DocumentRecord } from '@/lib/database/types';

import type { Testimonial, TestimonialWritePayload } from './types';

interface TestimonialDocument extends DocumentRecord {
  display_order: number;
  ends_at: string | null;
  is_active: boolean;
  name: string;
  occasion: string;
  photo_alt: string;
  photo_url: string;
  quote: string;
  stars: number;
  starts_at: string | null;
}

function toRow(doc: DocumentRecord & Record<string, unknown>): Testimonial {
  const record = doc as unknown as TestimonialDocument;
  return {
    id: record.id,
    displayOrder: record.display_order,
    endsAt: record.ends_at,
    isActive: record.is_active,
    name: record.name,
    occasion: record.occasion,
    photoAlt: record.photo_alt,
    photoUrl: record.photo_url,
    quote: record.quote,
    stars: record.stars,
    startsAt: record.starts_at,
  };
}

function toDocumentData(payload: TestimonialWritePayload): Record<string, unknown> {
  return {
    display_order: payload.displayOrder,
    ends_at: payload.endsAt,
    is_active: payload.isActive,
    name: payload.name,
    occasion: payload.occasion,
    photo_alt: payload.photoAlt,
    photo_url: payload.photoUrl,
    quote: payload.quote,
    stars: payload.stars,
    starts_at: payload.startsAt,
  };
}

export const testimonialConfig: OrderableCollectionConfig<Testimonial, TestimonialWritePayload> = {
  collectionId: APPWRITE_COLLECTIONS.testimonials,
  assetUrlField: 'photoUrl',
  toRow,
  toDocumentData,
};
