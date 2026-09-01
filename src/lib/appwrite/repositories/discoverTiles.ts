import { randomUUID } from 'node:crypto';

import { ID, Query } from 'node-appwrite';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type { DiscoverTileDoc } from '@/lib/appwrite/types';
import type { DiscoverTileRow } from '@/lib/db/rows';

import { getRepositoryContext, listAllDocuments, withAppwriteTransaction } from './shared';

const C = APPWRITE_COLLECTIONS;

export interface DiscoverTileWritePayload {
  description: string;
  displayOrder: number;
  endsAt: string | null;
  href: string;
  icon: string;
  imageUrl: string;
  isActive: boolean;
  isExternal: boolean;
  startsAt: string | null;
  title: string;
}

function toDiscoverTileRow(doc: DiscoverTileDoc): DiscoverTileRow {
  return {
    description: doc.description,
    display_order: doc.display_order,
    ends_at: doc.ends_at,
    href: doc.href,
    icon: doc.icon,
    id: doc.$id,
    image_url: doc.image_url,
    is_active: doc.is_active,
    is_external: doc.is_external,
    starts_at: doc.starts_at,
    title: doc.title,
  };
}

function toDocumentData(payload: DiscoverTileWritePayload) {
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

export async function listDiscoverTiles(): Promise<DiscoverTileRow[]> {
  const { databases, databaseId } = getRepositoryContext();
  const docs = await listAllDocuments<DiscoverTileDoc>(databases, databaseId, C.discoverTiles, [
    Query.orderAsc('display_order'),
  ]);
  return docs.map(toDiscoverTileRow);
}

export async function findDiscoverTileById(id: string): Promise<DiscoverTileRow | null> {
  const { databases, databaseId } = getRepositoryContext();
  try {
    const doc = await databases.getDocument<DiscoverTileDoc>({
      databaseId,
      collectionId: C.discoverTiles,
      documentId: id,
    });
    return toDiscoverTileRow(doc);
  } catch {
    return null;
  }
}

export async function getNextDiscoverTileOrder(): Promise<number> {
  const { databases, databaseId } = getRepositoryContext();
  const page = await databases.listDocuments<DiscoverTileDoc>({
    databaseId,
    collectionId: C.discoverTiles,
    queries: [Query.orderDesc('display_order'), Query.limit(1)],
  });
  return (page.documents[0]?.display_order ?? 0) + 1;
}

export async function createDiscoverTileDocument(payload: DiscoverTileWritePayload): Promise<string> {
  const { databases, databaseId } = getRepositoryContext();
  const doc = await databases.createDocument<DiscoverTileDoc>({
    databaseId,
    collectionId: C.discoverTiles,
    documentId: ID.custom(randomUUID()),
    data: toDocumentData(payload),
  });
  return doc.$id;
}

export async function updateDiscoverTileDocument(
  id: string,
  payload: DiscoverTileWritePayload,
): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<DiscoverTileDoc>({
    databaseId,
    collectionId: C.discoverTiles,
    documentId: id,
    data: toDocumentData(payload),
  });
}

export async function setDiscoverTileActive(id: string, isActive: boolean): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<DiscoverTileDoc>({
    databaseId,
    collectionId: C.discoverTiles,
    documentId: id,
    data: { is_active: isActive },
  });
}

export async function deleteDiscoverTileDocument(id: string): Promise<string | null> {
  const existing = await findDiscoverTileById(id);
  if (!existing) return null;
  const { databases, databaseId } = getRepositoryContext();
  await databases.deleteDocument({
    databaseId,
    collectionId: C.discoverTiles,
    documentId: id,
  });
  return existing.image_url;
}

export async function reorderDiscoverTilesAppwrite(orderedIds: string[]): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  const documents = await listAllDocuments<DiscoverTileDoc>(databases, databaseId, C.discoverTiles, [
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
        collectionId: C.discoverTiles,
        documentId,
        data: { display_order: slots[index] },
      })),
    }),
  );
}
