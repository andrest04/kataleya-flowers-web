import { randomUUID } from 'node:crypto';

import { ID, Query } from 'node-appwrite';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type { HeroSlideDoc } from '@/lib/appwrite/types';
import type { HeroCtaType, HeroSlideRow } from '@/lib/db/rows';

import { getRepositoryContext, listAllDocuments, withAppwriteTransaction } from './shared';

const C = APPWRITE_COLLECTIONS;

export interface HeroSlideWritePayload {
  altText: string;
  ctaLabel: string | null;
  ctaType: HeroCtaType;
  ctaValue: string | null;
  displayOrder: number;
  endsAt: string | null;
  focus: string | null;
  imageUrl: string;
  isActive: boolean;
  kicker: string;
  name: string;
  startsAt: string | null;
  subtitle: string | null;
  title: string;
}

function toHeroSlideRow(doc: HeroSlideDoc): HeroSlideRow {
  return {
    alt_text: doc.alt_text,
    cta_label: doc.cta_label,
    cta_type: doc.cta_type,
    cta_value: doc.cta_value,
    display_order: doc.display_order,
    ends_at: doc.ends_at,
    focus: doc.focus,
    id: doc.$id,
    image_url: doc.image_url,
    is_active: doc.is_active,
    kicker: doc.kicker,
    name: doc.name,
    starts_at: doc.starts_at,
    subtitle: doc.subtitle,
    title: doc.title,
  };
}

function toDocumentData(payload: HeroSlideWritePayload) {
  return {
    alt_text: payload.altText,
    cta_label: payload.ctaLabel,
    cta_type: payload.ctaType,
    cta_value: payload.ctaValue,
    display_order: payload.displayOrder,
    ends_at: payload.endsAt,
    focus: payload.focus,
    image_url: payload.imageUrl,
    is_active: payload.isActive,
    kicker: payload.kicker,
    name: payload.name,
    starts_at: payload.startsAt,
    subtitle: payload.subtitle,
    title: payload.title,
  };
}

export async function countActiveHeroSlides(exceptId?: string): Promise<number> {
  const slides = await listHeroSlides();
  return slides.filter((slide) => slide.is_active && slide.id !== exceptId).length;
}

export async function listHeroSlides(): Promise<HeroSlideRow[]> {
  const { databases, databaseId } = getRepositoryContext();
  const docs = await listAllDocuments<HeroSlideDoc>(databases, databaseId, C.heroSlides, [
    Query.orderAsc('display_order'),
  ]);
  return docs.map(toHeroSlideRow);
}

export async function findHeroSlideById(id: string): Promise<HeroSlideRow | null> {
  const { databases, databaseId } = getRepositoryContext();
  try {
    const doc = await databases.getDocument<HeroSlideDoc>({
      databaseId,
      collectionId: C.heroSlides,
      documentId: id,
    });
    return toHeroSlideRow(doc);
  } catch {
    return null;
  }
}

export async function getNextHeroSlideOrder(): Promise<number> {
  const { databases, databaseId } = getRepositoryContext();
  const page = await databases.listDocuments<HeroSlideDoc>({
    databaseId,
    collectionId: C.heroSlides,
    queries: [Query.orderDesc('display_order'), Query.limit(1)],
  });
  return (page.documents[0]?.display_order ?? 0) + 1;
}

export async function getFrontHeroSlideOrder(): Promise<number> {
  const { databases, databaseId } = getRepositoryContext();
  const page = await databases.listDocuments<HeroSlideDoc>({
    databaseId,
    collectionId: C.heroSlides,
    queries: [Query.orderAsc('display_order'), Query.limit(1)],
  });
  return (page.documents[0]?.display_order ?? 1) - 1;
}

export async function createHeroSlideDocument(payload: HeroSlideWritePayload): Promise<string> {
  const { databases, databaseId } = getRepositoryContext();
  const doc = await databases.createDocument<HeroSlideDoc>({
    databaseId,
    collectionId: C.heroSlides,
    documentId: ID.custom(randomUUID()),
    data: toDocumentData(payload),
  });
  return doc.$id;
}

export async function updateHeroSlideDocument(
  id: string,
  payload: HeroSlideWritePayload,
): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<HeroSlideDoc>({
    databaseId,
    collectionId: C.heroSlides,
    documentId: id,
    data: toDocumentData(payload),
  });
}

export async function activateHeroSlideExclusive(id: string): Promise<void> {
  const slides = await listHeroSlides();
  const { databases, databaseId } = getRepositoryContext();
  const operations = slides.map((slide) => ({
    action: 'update' as const,
    databaseId,
    collectionId: C.heroSlides,
    documentId: slide.id,
    data: { is_active: slide.id === id },
  }));
  await withAppwriteTransaction((transactionId) =>
    databases.createOperations({ transactionId, operations }),
  );
}

export async function setHeroSlideActive(id: string, isActive: boolean): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<HeroSlideDoc>({
    databaseId,
    collectionId: C.heroSlides,
    documentId: id,
    data: { is_active: isActive },
  });
}

export async function deleteHeroSlideDocument(id: string): Promise<string | null> {
  const existing = await findHeroSlideById(id);
  if (!existing) return null;
  const { databases, databaseId } = getRepositoryContext();
  await databases.deleteDocument({
    databaseId,
    collectionId: C.heroSlides,
    documentId: id,
  });
  return existing.image_url;
}

export async function reorderHeroSlidesAppwrite(orderedIds: string[]): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  const documents = await listAllDocuments<HeroSlideDoc>(databases, databaseId, C.heroSlides, [
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
        collectionId: C.heroSlides,
        documentId,
        data: { display_order: slots[index] },
      })),
    }),
  );
}
