import { randomUUID } from 'node:crypto';

import { ID, Query } from 'node-appwrite';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type { ValuePropDoc } from '@/lib/appwrite/types';
import type { ValuePropRow } from '@/lib/db/rows';

import { getRepositoryContext, listAllDocuments, withAppwriteTransaction } from './shared';

const C = APPWRITE_COLLECTIONS;

export interface ValuePropWritePayload {
  description: string;
  displayOrder: number;
  endsAt: string | null;
  href: string;
  icon: string;
  isActive: boolean;
  isAnchor: boolean;
  isExternal: boolean;
  linkLabel: string;
  startsAt: string | null;
  title: string;
}

function toValuePropRow(doc: ValuePropDoc): ValuePropRow {
  return {
    description: doc.description,
    display_order: doc.display_order,
    ends_at: doc.ends_at,
    href: doc.href,
    icon: doc.icon,
    id: doc.$id,
    is_active: doc.is_active,
    is_anchor: doc.is_anchor,
    is_external: doc.is_external,
    link_label: doc.link_label,
    starts_at: doc.starts_at,
    title: doc.title,
  };
}

function toDocumentData(payload: ValuePropWritePayload) {
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

export async function listValueProps(): Promise<ValuePropRow[]> {
  const { databases, databaseId } = getRepositoryContext();
  const docs = await listAllDocuments<ValuePropDoc>(databases, databaseId, C.valueProps, [
    Query.orderAsc('display_order'),
  ]);
  return docs.map(toValuePropRow);
}

export async function findValuePropById(id: string): Promise<ValuePropRow | null> {
  const { databases, databaseId } = getRepositoryContext();
  try {
    const doc = await databases.getDocument<ValuePropDoc>({
      databaseId,
      collectionId: C.valueProps,
      documentId: id,
    });
    return toValuePropRow(doc);
  } catch {
    return null;
  }
}

export async function getNextValuePropOrder(): Promise<number> {
  const { databases, databaseId } = getRepositoryContext();
  const page = await databases.listDocuments<ValuePropDoc>({
    databaseId,
    collectionId: C.valueProps,
    queries: [Query.orderDesc('display_order'), Query.limit(1)],
  });
  return (page.documents[0]?.display_order ?? 0) + 1;
}

export async function createValuePropDocument(payload: ValuePropWritePayload): Promise<string> {
  const { databases, databaseId } = getRepositoryContext();
  const doc = await databases.createDocument<ValuePropDoc>({
    databaseId,
    collectionId: C.valueProps,
    documentId: ID.custom(randomUUID()),
    data: toDocumentData(payload),
  });
  return doc.$id;
}

export async function updateValuePropDocument(
  id: string,
  payload: ValuePropWritePayload,
): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<ValuePropDoc>({
    databaseId,
    collectionId: C.valueProps,
    documentId: id,
    data: toDocumentData(payload),
  });
}

export async function setValuePropActive(id: string, isActive: boolean): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<ValuePropDoc>({
    databaseId,
    collectionId: C.valueProps,
    documentId: id,
    data: { is_active: isActive },
  });
}

export async function deleteValuePropDocument(id: string): Promise<boolean> {
  const existing = await findValuePropById(id);
  if (!existing) return false;
  const { databases, databaseId } = getRepositoryContext();
  await databases.deleteDocument({
    databaseId,
    collectionId: C.valueProps,
    documentId: id,
  });
  return true;
}

export async function reorderValuePropsAppwrite(orderedIds: string[]): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  const documents = await listAllDocuments<ValuePropDoc>(databases, databaseId, C.valueProps, [
    Query.equal('$id', orderedIds),
    Query.select(['$id', 'display_order']),
  ]);
  const slots = documents.map((document) => document.display_order).sort((a, b) => a - b);
  const presentIds = orderedIds.filter((id) => documents.some((document) => document.$id === id));
  if (slots.length !== presentIds.length) return;

  await withAppwriteTransaction((transactionId) =>
    databases.createOperations({
      transactionId,
      operations: presentIds.map((documentId, index) => ({
        action: 'update',
        databaseId,
        collectionId: C.valueProps,
        documentId,
        data: { display_order: slots[index] },
      })),
    }),
  );
}
