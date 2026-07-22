import { AppwriteException, ID, Query } from 'node-appwrite';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type { ComplaintDoc, CounterDoc } from '@/lib/appwrite/types';

import { getRepositoryContext, listAllDocuments } from './shared';

const C = APPWRITE_COLLECTIONS;

export interface ComplaintRepoRow {
  id: string;
  correlativo: number;
  complaint_type: string;
  consumer_name: string;
  consumer_doc_type: string;
  consumer_doc_number: string;
  consumer_email: string;
  consumer_phone: string | null;
  consumer_address: string;
  is_minor: boolean;
  guardian_name: string | null;
  item_type: string;
  item_description: string;
  claimed_amount: number | null;
  detail: string;
  consumer_request: string;
  provider_response: string | null;
  status: string;
  responded_at: string | null;
  email_sent: boolean;
  created_at: string;
  updated_at: string;
}

function toComplaintRow(doc: ComplaintDoc): ComplaintRepoRow {
  return {
    id: doc.$id,
    correlativo: doc.correlativo,
    complaint_type: doc.complaint_type,
    consumer_name: doc.consumer_name,
    consumer_doc_type: doc.consumer_doc_type,
    consumer_doc_number: doc.consumer_doc_number,
    consumer_email: doc.consumer_email,
    consumer_phone: doc.consumer_phone,
    consumer_address: doc.consumer_address,
    is_minor: doc.is_minor,
    guardian_name: doc.guardian_name,
    item_type: doc.item_type,
    item_description: doc.item_description,
    claimed_amount: doc.claimed_amount,
    detail: doc.detail,
    consumer_request: doc.consumer_request,
    provider_response: doc.provider_response,
    status: doc.status,
    responded_at: doc.responded_at,
    email_sent: doc.email_sent,
    created_at: doc.$createdAt,
    updated_at: doc.$updatedAt,
  };
}

export async function listComplaints(): Promise<ComplaintRepoRow[]> {
  const { databases, databaseId } = getRepositoryContext();

  const docs = await listAllDocuments<ComplaintDoc>(databases, databaseId, C.complaints, [
    Query.orderDesc('$createdAt'),
  ]);

  return docs.map(toComplaintRow);
}

export async function findComplaintById(
  id: string,
): Promise<ComplaintRepoRow | null> {
  const { databases, databaseId } = getRepositoryContext();

  try {
    const doc = await databases.getDocument<ComplaintDoc>({
      databaseId,
      collectionId: C.complaints,
      documentId: id,
    });
    return toComplaintRow(doc);
  } catch {
    return null;
  }
}

function counterDocId(year: number): string {
  return `complaints-${year}`;
}

export async function allocateCorrelativo(year: number): Promise<number> {
  const { databases, databaseId } = getRepositoryContext();
  const documentId = counterDocId(year);

  try {
    const updated = await databases.incrementDocumentAttribute<CounterDoc>({
      databaseId,
      collectionId: C.counters,
      documentId,
      attribute: 'value',
      value: 1,
    });
    return updated.value;
  } catch (err) {
    if (!(err instanceof AppwriteException) || err.code !== 404) throw err;

    try {
      const created = await databases.createDocument<CounterDoc>({
        databaseId,
        collectionId: C.counters,
        documentId,
        data: { value: 1 },
      });
      return created.value;
    } catch (createErr) {
      if (!(createErr instanceof AppwriteException) || createErr.code !== 409) {
        throw createErr;
      }
      const retried = await databases.incrementDocumentAttribute<CounterDoc>({
        databaseId,
        collectionId: C.counters,
        documentId,
        attribute: 'value',
        value: 1,
      });
      return retried.value;
    }
  }
}

export interface ComplaintInsert {
  correlativo: number;
  complaint_type: string;
  consumer_name: string;
  consumer_doc_type: string;
  consumer_doc_number: string;
  consumer_email: string;
  consumer_phone: string | null;
  consumer_address: string;
  is_minor: boolean;
  guardian_name: string | null;
  item_type: string;
  item_description: string;
  claimed_amount: number | null;
  detail: string;
  consumer_request: string;
}

export interface ComplaintCreated {
  id: string;
  correlativo: number;
  created_at: string;
}

export async function insertComplaint(
  input: ComplaintInsert,
): Promise<ComplaintCreated> {
  const { databases, databaseId } = getRepositoryContext();

  const doc = await databases.createDocument<ComplaintDoc>({
    databaseId,
    collectionId: C.complaints,
    documentId: ID.unique(),
    data: {
      correlativo: input.correlativo,
      complaint_type: input.complaint_type,
      consumer_name: input.consumer_name,
      consumer_doc_type: input.consumer_doc_type,
      consumer_doc_number: input.consumer_doc_number,
      consumer_email: input.consumer_email,
      consumer_phone: input.consumer_phone,
      consumer_address: input.consumer_address,
      is_minor: input.is_minor,
      guardian_name: input.guardian_name,
      item_type: input.item_type,
      item_description: input.item_description,
      claimed_amount: input.claimed_amount,
      detail: input.detail,
      consumer_request: input.consumer_request,
      provider_response: null,
      status: 'PENDIENTE',
      responded_at: null,
      email_sent: false,
    },
  });

  return { id: doc.$id, correlativo: doc.correlativo, created_at: doc.$createdAt };
}

export interface ComplaintStatusUpdate {
  status: string;
  provider_response: string | null;
  responded_at: string | null;
}

export async function updateComplaintDocument(
  id: string,
  data: ComplaintStatusUpdate,
): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();

  await databases.updateDocument<ComplaintDoc>({
    databaseId,
    collectionId: C.complaints,
    documentId: id,
    data: {
      status: data.status,
      provider_response: data.provider_response,
      responded_at: data.responded_at,
    },
  });
}
