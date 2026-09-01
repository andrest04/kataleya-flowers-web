import { randomUUID } from 'node:crypto';

import { ID, Query } from 'node-appwrite';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type { PromoBannerDoc } from '@/lib/appwrite/types';
import type { PromoBannerRow } from '@/lib/db/rows';
import { promoPresetKey } from '@/lib/promoPresetKey';

import { getRepositoryContext, listAllDocuments, withAppwriteTransaction } from './shared';

const C = APPWRITE_COLLECTIONS;

export interface PromoBannerWritePayload {
  contentPosition: 'top' | 'bottom';
  ctaExternal: boolean;
  ctaHref: string;
  ctaLabel: string;
  description: string;
  displayOrder: number;
  endsAt: string | null;
  imageUrl: string;
  isActive: boolean;
  name: string;
  startsAt: string | null;
  title: string;
}

function toPromoBannerRow(doc: PromoBannerDoc): PromoBannerRow {
  return {
    content_position: doc.content_position,
    cta_external: doc.cta_external,
    cta_href: doc.cta_href,
    cta_label: doc.cta_label,
    description: doc.description,
    display_order: doc.display_order,
    ends_at: doc.ends_at,
    id: doc.$id,
    image_url: doc.image_url,
    is_active: doc.is_active,
    name: doc.name,
    starts_at: doc.starts_at,
    title: doc.title,
  };
}

function toDocumentData(payload: PromoBannerWritePayload) {
  return {
    content_position: payload.contentPosition,
    cta_external: payload.ctaExternal,
    cta_href: payload.ctaHref,
    cta_label: payload.ctaLabel,
    description: payload.description,
    display_order: payload.displayOrder,
    ends_at: payload.endsAt,
    image_url: payload.imageUrl,
    is_active: payload.isActive,
    name: payload.name,
    starts_at: payload.startsAt,
    title: payload.title,
  };
}

export async function countActivePromoPresets(exceptKey?: string): Promise<number> {
  const banners = await listPromoBanners();
  const keys = new Set(
    banners
      .filter((banner) => banner.is_active && promoPresetKey(banner) !== exceptKey)
      .map((banner) => promoPresetKey(banner)),
  );
  return keys.size;
}

export async function listPromoBannersByPreset(key: string): Promise<PromoBannerRow[]> {
  const banners = await listPromoBanners();
  return banners.filter((banner) => promoPresetKey(banner) === key);
}

export async function activatePromoPresetExclusive(key: string): Promise<void> {
  const banners = await listPromoBanners();
  const { databases, databaseId } = getRepositoryContext();
  const operations = banners.map((banner) => ({
    action: 'update' as const,
    databaseId,
    collectionId: C.promoBanners,
    documentId: banner.id,
    data: { is_active: promoPresetKey(banner) === key },
  }));
  await withAppwriteTransaction((transactionId) =>
    databases.createOperations({ transactionId, operations }),
  );
}

export async function setPromoPresetActive(key: string, isActive: boolean): Promise<void> {
  const banners = await listPromoBannersByPreset(key);
  const { databases, databaseId } = getRepositoryContext();
  if (banners.length === 0) return;
  await withAppwriteTransaction((transactionId) =>
    databases.createOperations({
      transactionId,
      operations: banners.map((banner) => ({
        action: 'update' as const,
        databaseId,
        collectionId: C.promoBanners,
        documentId: banner.id,
        data: { is_active: isActive },
      })),
    }),
  );
}

export async function deletePromoPresetDocuments(key: string): Promise<string[]> {
  const banners = await listPromoBannersByPreset(key);
  const { databases, databaseId } = getRepositoryContext();
  const imageUrls: string[] = [];
  for (const banner of banners) {
    await databases.deleteDocument({
      databaseId,
      collectionId: C.promoBanners,
      documentId: banner.id,
    });
    imageUrls.push(banner.image_url);
  }
  return imageUrls;
}

export async function listPromoBanners(): Promise<PromoBannerRow[]> {
  const { databases, databaseId } = getRepositoryContext();
  const docs = await listAllDocuments<PromoBannerDoc>(databases, databaseId, C.promoBanners, [
    Query.orderAsc('display_order'),
  ]);
  return docs.map(toPromoBannerRow);
}

export async function findPromoBannerById(id: string): Promise<PromoBannerRow | null> {
  const { databases, databaseId } = getRepositoryContext();
  try {
    const doc = await databases.getDocument<PromoBannerDoc>({
      databaseId,
      collectionId: C.promoBanners,
      documentId: id,
    });
    return toPromoBannerRow(doc);
  } catch {
    return null;
  }
}

export async function getNextPromoBannerOrder(): Promise<number> {
  const { databases, databaseId } = getRepositoryContext();
  const page = await databases.listDocuments<PromoBannerDoc>({
    databaseId,
    collectionId: C.promoBanners,
    queries: [Query.orderDesc('display_order'), Query.limit(1)],
  });
  return (page.documents[0]?.display_order ?? 0) + 1;
}

export async function createPromoBannerDocument(payload: PromoBannerWritePayload): Promise<string> {
  const { databases, databaseId } = getRepositoryContext();
  const doc = await databases.createDocument<PromoBannerDoc>({
    databaseId,
    collectionId: C.promoBanners,
    documentId: ID.custom(randomUUID()),
    data: toDocumentData(payload),
  });
  return doc.$id;
}

export async function updatePromoBannerDocument(
  id: string,
  payload: PromoBannerWritePayload,
): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<PromoBannerDoc>({
    databaseId,
    collectionId: C.promoBanners,
    documentId: id,
    data: toDocumentData(payload),
  });
}

export async function setPromoBannerActive(id: string, isActive: boolean): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<PromoBannerDoc>({
    databaseId,
    collectionId: C.promoBanners,
    documentId: id,
    data: { is_active: isActive },
  });
}

export async function deletePromoBannerDocument(id: string): Promise<string | null> {
  const existing = await findPromoBannerById(id);
  if (!existing) return null;
  const { databases, databaseId } = getRepositoryContext();
  await databases.deleteDocument({
    databaseId,
    collectionId: C.promoBanners,
    documentId: id,
  });
  return existing.image_url;
}

export async function reorderPromoBannersAppwrite(orderedIds: string[]): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  const documents = await listAllDocuments<PromoBannerDoc>(databases, databaseId, C.promoBanners, [
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
        collectionId: C.promoBanners,
        documentId,
        data: { display_order: slots[index] },
      })),
    }),
  );
}
