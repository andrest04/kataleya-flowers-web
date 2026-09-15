import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type { OrderableCollectionConfig } from '@/lib/database/orderableCollection/types';
import type { DocumentRecord } from '@/lib/database/types';

import type { DiscoverTile, DiscoverTileWritePayload } from './types';

interface DiscoverTileDocument extends DocumentRecord {
  description: string;
  display_order: number;
  ends_at: string | null;
  href: string;
  icon: string;
  image_url: string;
  is_active: boolean;
  is_external: boolean;
  starts_at: string | null;
  title: string;
}

function toRow(doc: DocumentRecord & Record<string, unknown>): DiscoverTile {
  const record = doc as unknown as DiscoverTileDocument;
  return {
    id: record.id,
    description: record.description,
    displayOrder: record.display_order,
    endsAt: record.ends_at,
    href: record.href,
    icon: record.icon,
    imageUrl: record.image_url,
    isActive: record.is_active,
    isExternal: record.is_external,
    startsAt: record.starts_at,
    title: record.title,
  };
}

function toDocumentData(payload: DiscoverTileWritePayload): Record<string, unknown> {
  return {
    description: payload.description,
    display_order: payload.displayOrder,
    ends_at: payload.endsAt,
    href: payload.href,
    icon: payload.icon,
    image_url: payload.imageUrl,
    is_active: payload.isActive,
    is_external: payload.isExternal,
    starts_at: payload.startsAt,
    title: payload.title,
  };
}

export const discoverTileConfig: OrderableCollectionConfig<DiscoverTile, DiscoverTileWritePayload> = {
  collectionId: APPWRITE_COLLECTIONS.discoverTiles,
  assetUrlField: 'imageUrl',
  toRow,
  toDocumentData,
};
