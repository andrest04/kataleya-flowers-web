import { describe, expect, it } from 'vitest';

import type { DocumentRecord } from '@/lib/database/types';

import { discoverTileConfig } from './config';
import type { DiscoverTileWritePayload } from './types';

describe('discoverTileConfig', () => {
  it('carries the discover_tiles collection id and imageUrl asset field', () => {
    expect(discoverTileConfig.collectionId).toBe('discover_tiles');
    expect(discoverTileConfig.assetUrlField).toBe('imageUrl');
  });

  it('round-trips a document through toDocumentData and toRow', () => {
    const payload: DiscoverTileWritePayload = {
      description: 'Entrega el mismo día',
      displayOrder: 1,
      endsAt: null,
      href: '/#contacto',
      icon: 'truck',
      imageUrl: 'https://example.com/tile.jpg',
      isActive: true,
      isExternal: false,
      startsAt: null,
      title: 'Entrega',
    };

    const data = discoverTileConfig.toDocumentData(payload);
    const doc: DocumentRecord & Record<string, unknown> = {
      id: 'tile-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      ...data,
    };

    const row = discoverTileConfig.toRow(doc);

    expect(row).toEqual({
      id: 'tile-1',
      description: payload.description,
      displayOrder: payload.displayOrder,
      endsAt: payload.endsAt,
      href: payload.href,
      icon: payload.icon,
      imageUrl: payload.imageUrl,
      isActive: payload.isActive,
      isExternal: payload.isExternal,
      startsAt: payload.startsAt,
      title: payload.title,
    });
  });
});
