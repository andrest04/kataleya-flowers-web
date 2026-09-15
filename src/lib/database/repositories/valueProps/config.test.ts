import { describe, expect, it } from 'vitest';

import type { DocumentRecord } from '@/lib/database/types';

import { valuePropConfig } from './config';
import type { ValuePropWritePayload } from './types';

describe('valuePropConfig', () => {
  it('carries the value_props collection id and no asset field', () => {
    expect(valuePropConfig.collectionId).toBe('value_props');
    expect(valuePropConfig.assetUrlField).toBeUndefined();
  });

  it('round-trips a document through toDocumentData and toRow', () => {
    const payload: ValuePropWritePayload = {
      description: 'Tres décadas floreciendo',
      displayOrder: 1,
      endsAt: null,
      href: '#nosotros',
      icon: 'flower2',
      isActive: true,
      isAnchor: true,
      isExternal: false,
      linkLabel: 'Conoce la historia',
      startsAt: null,
      title: 'Años floreciendo',
    };

    const data = valuePropConfig.toDocumentData(payload);
    const doc: DocumentRecord & Record<string, unknown> = {
      id: 'value-prop-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      ...data,
    };

    const row = valuePropConfig.toRow(doc);

    expect(row).toEqual({
      id: 'value-prop-1',
      description: payload.description,
      displayOrder: payload.displayOrder,
      endsAt: payload.endsAt,
      href: payload.href,
      icon: payload.icon,
      isActive: payload.isActive,
      isAnchor: payload.isAnchor,
      isExternal: payload.isExternal,
      linkLabel: payload.linkLabel,
      startsAt: payload.startsAt,
      title: payload.title,
    });
  });
});
