import { randomUUID } from 'node:crypto';

import { ID, Query } from 'node-appwrite';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type { TestimonialDoc } from '@/lib/appwrite/types';
import type { TestimonialRow } from '@/lib/db/rows';

import { getRepositoryContext, listAllDocuments, withAppwriteTransaction } from './shared';

const C = APPWRITE_COLLECTIONS;

export interface TestimonialWritePayload {
  displayOrder: number;
  endsAt: string | null;
  isActive: boolean;
  name: string;
  occasion: string;
  photoAlt: string;
  photoUrl: string;
  quote: string;
  stars: number;
  startsAt: string | null;
}

function toTestimonialRow(doc: TestimonialDoc): TestimonialRow {
  return {
    display_order: doc.display_order,
    ends_at: doc.ends_at,
    id: doc.$id,
    is_active: doc.is_active,
    name: doc.name,
    occasion: doc.occasion,
    photo_alt: doc.photo_alt,
    photo_url: doc.photo_url,
    quote: doc.quote,
    stars: doc.stars,
    starts_at: doc.starts_at,
  };
}

function toDocumentData(payload: TestimonialWritePayload) {
  return {
    display_order: payload.displayOrder,
    ends_at: payload.endsAt,
    is_active: payload.isActive,
    name: payload.name,
    occasion: payload.occasion,
    photo_alt: payload.photoAlt,
    photo_url: payload.photoUrl,
    quote: payload.quote,
    stars: payload.stars,
    starts_at: payload.startsAt,
  };
}

export async function listTestimonials(): Promise<TestimonialRow[]> {
  const { databases, databaseId } = getRepositoryContext();
  const docs = await listAllDocuments<TestimonialDoc>(databases, databaseId, C.testimonials, [
    Query.orderAsc('display_order'),
  ]);
  return docs.map(toTestimonialRow);
}

export async function findTestimonialById(id: string): Promise<TestimonialRow | null> {
  const { databases, databaseId } = getRepositoryContext();
  try {
    const doc = await databases.getDocument<TestimonialDoc>({
      databaseId,
      collectionId: C.testimonials,
      documentId: id,
    });
    return toTestimonialRow(doc);
  } catch {
    return null;
  }
}

export async function getNextTestimonialOrder(): Promise<number> {
  const { databases, databaseId } = getRepositoryContext();
  const page = await databases.listDocuments<TestimonialDoc>({
    databaseId,
    collectionId: C.testimonials,
    queries: [Query.orderDesc('display_order'), Query.limit(1)],
  });
  return (page.documents[0]?.display_order ?? 0) + 1;
}

export async function createTestimonialDocument(payload: TestimonialWritePayload): Promise<string> {
  const { databases, databaseId } = getRepositoryContext();
  const doc = await databases.createDocument<TestimonialDoc>({
    databaseId,
    collectionId: C.testimonials,
    documentId: ID.custom(randomUUID()),
    data: toDocumentData(payload),
  });
  return doc.$id;
}

export async function updateTestimonialDocument(
  id: string,
  payload: TestimonialWritePayload,
): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<TestimonialDoc>({
    databaseId,
    collectionId: C.testimonials,
    documentId: id,
    data: toDocumentData(payload),
  });
}

export async function setTestimonialActive(id: string, isActive: boolean): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  await databases.updateDocument<TestimonialDoc>({
    databaseId,
    collectionId: C.testimonials,
    documentId: id,
    data: { is_active: isActive },
  });
}

export async function deleteTestimonialDocument(id: string): Promise<string | null> {
  const existing = await findTestimonialById(id);
  if (!existing) return null;
  const { databases, databaseId } = getRepositoryContext();
  await databases.deleteDocument({
    databaseId,
    collectionId: C.testimonials,
    documentId: id,
  });
  return existing.photo_url;
}

export async function reorderTestimonialsAppwrite(orderedIds: string[]): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  const documents = await listAllDocuments<TestimonialDoc>(databases, databaseId, C.testimonials, [
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
        collectionId: C.testimonials,
        documentId,
        data: { display_order: slots[index] },
      })),
    }),
  );
}
