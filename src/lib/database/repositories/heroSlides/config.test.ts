import { describe, expect, it } from 'vitest';

import type { DocumentRecord } from '@/lib/database/types';

import { heroSlideConfig } from './config';
import type { HeroSlideWritePayload } from './types';

describe('heroSlideConfig', () => {
  it('carries the hero_slides collection id', () => {
    expect(heroSlideConfig.collectionId).toBe('hero_slides');
    expect(heroSlideConfig.assetUrlField).toBe('imageUrl');
  });

  it('round-trips a document through toDocumentData and toRow', () => {
    const payload: HeroSlideWritePayload = {
      altText: 'Rosas rojas',
      ctaLabel: 'Ver más',
      ctaType: 'url',
      ctaValue: 'https://example.com',
      displayOrder: 2,
      endsAt: null,
      focus: '50% center',
      imageUrl: 'https://example.com/rosas.jpg',
      isActive: true,
      kicker: 'Nuevo',
      name: 'Slide de rosas',
      startsAt: null,
      subtitle: 'Frescas todos los días',
      title: 'Rosas',
    };

    const data = heroSlideConfig.toDocumentData(payload);
    const doc: DocumentRecord & Record<string, unknown> = {
      id: 'slide-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      ...data,
    };

    const row = heroSlideConfig.toRow(doc);

    expect(row).toEqual({
      id: 'slide-1',
      altText: payload.altText,
      ctaLabel: payload.ctaLabel,
      ctaType: payload.ctaType,
      ctaValue: payload.ctaValue,
      displayOrder: payload.displayOrder,
      endsAt: payload.endsAt,
      focus: payload.focus,
      imageUrl: payload.imageUrl,
      isActive: payload.isActive,
      kicker: payload.kicker,
      name: payload.name,
      startsAt: payload.startsAt,
      subtitle: payload.subtitle,
      title: payload.title,
    });
  });
});
