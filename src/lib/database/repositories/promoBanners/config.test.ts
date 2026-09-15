import { describe, expect, it } from 'vitest';

import { BUSINESS } from '@/lib/constants';
import type { DocumentRecord } from '@/lib/database/types';

import { promoBannerConfig } from './config';
import type { PromoBannerWritePayload } from './types';

describe('promoBannerConfig', () => {
  it('carries the promo_banners collection id and imageUrl asset field', () => {
    expect(promoBannerConfig.collectionId).toBe('promo_banners');
    expect(promoBannerConfig.assetUrlField).toBe('imageUrl');
  });

  it('round-trips a document through toDocumentData and toRow', () => {
    const payload: PromoBannerWritePayload = {
      contentPosition: 'top',
      ctaExternal: true,
      ctaHref: BUSINESS.whatsapp,
      ctaLabel: 'Pedir por WhatsApp',
      description: 'Pedidos a tiempo',
      displayOrder: 1,
      endsAt: null,
      imageUrl: 'https://example.com/banner.jpg',
      isActive: true,
      name: 'peonias',
      startsAt: null,
      title: 'Entrega el mismo día',
    };

    const data = promoBannerConfig.toDocumentData(payload);
    const doc: DocumentRecord & Record<string, unknown> = {
      id: 'banner-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      ...data,
    };

    const row = promoBannerConfig.toRow(doc);

    expect(row).toEqual({
      id: 'banner-1',
      contentPosition: payload.contentPosition,
      ctaExternal: payload.ctaExternal,
      ctaHref: payload.ctaHref,
      ctaLabel: payload.ctaLabel,
      description: payload.description,
      displayOrder: payload.displayOrder,
      endsAt: payload.endsAt,
      imageUrl: payload.imageUrl,
      isActive: payload.isActive,
      name: payload.name,
      startsAt: payload.startsAt,
      title: payload.title,
    });
  });
});
