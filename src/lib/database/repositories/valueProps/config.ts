import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type { OrderableCollectionConfig } from '@/lib/database/orderableCollection/types';
import type { DocumentRecord } from '@/lib/database/types';

import type { ValueProp, ValuePropWritePayload } from './types';

interface ValuePropDocument extends DocumentRecord {
  description: string;
  display_order: number;
  ends_at: string | null;
  href: string;
  icon: string;
  is_active: boolean;
  is_anchor: boolean;
  is_external: boolean;
  link_label: string;
  starts_at: string | null;
  title: string;
}

function toRow(doc: DocumentRecord & Record<string, unknown>): ValueProp {
  const record = doc as unknown as ValuePropDocument;
  return {
    id: record.id,
    description: record.description,
    displayOrder: record.display_order,
    endsAt: record.ends_at,
    href: record.href,
    icon: record.icon,
    isActive: record.is_active,
    isAnchor: record.is_anchor,
    isExternal: record.is_external,
    linkLabel: record.link_label,
    startsAt: record.starts_at,
    title: record.title,
  };
}

function toDocumentData(payload: ValuePropWritePayload): Record<string, unknown> {
  return {
    description: payload.description,
    display_order: payload.displayOrder,
    ends_at: payload.endsAt,
    href: payload.href,
    icon: payload.icon,
    is_active: payload.isActive,
    is_anchor: payload.isAnchor,
    is_external: payload.isExternal,
    link_label: payload.linkLabel,
    starts_at: payload.startsAt,
    title: payload.title,
  };
}

export const valuePropConfig: OrderableCollectionConfig<ValueProp, ValuePropWritePayload> = {
  collectionId: APPWRITE_COLLECTIONS.valueProps,
  toRow,
  toDocumentData,
};
