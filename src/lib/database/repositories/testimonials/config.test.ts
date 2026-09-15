import { describe, expect, it } from 'vitest';

import type { DocumentRecord } from '@/lib/database/types';

import { testimonialConfig } from './config';
import type { TestimonialWritePayload } from './types';

describe('testimonialConfig', () => {
  it('carries the testimonials collection id and photoUrl asset field', () => {
    expect(testimonialConfig.collectionId).toBe('testimonials');
    expect(testimonialConfig.assetUrlField).toBe('photoUrl');
  });

  it('round-trips a document through toDocumentData and toRow', () => {
    const payload: TestimonialWritePayload = {
      displayOrder: 3,
      endsAt: null,
      isActive: true,
      name: 'Mariana R.',
      occasion: 'Cumpleaños',
      photoAlt: 'Clienta con bouquet',
      photoUrl: 'https://example.com/mariana.jpg',
      quote: 'Precioso arreglo.',
      stars: 5,
      startsAt: null,
    };

    const data = testimonialConfig.toDocumentData(payload);
    const doc: DocumentRecord & Record<string, unknown> = {
      id: 'testimonial-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      ...data,
    };

    const row = testimonialConfig.toRow(doc);

    expect(row).toEqual({
      id: 'testimonial-1',
      displayOrder: payload.displayOrder,
      endsAt: payload.endsAt,
      isActive: payload.isActive,
      name: payload.name,
      occasion: payload.occasion,
      photoAlt: payload.photoAlt,
      photoUrl: payload.photoUrl,
      quote: payload.quote,
      stars: payload.stars,
      startsAt: payload.startsAt,
    });
  });
});
