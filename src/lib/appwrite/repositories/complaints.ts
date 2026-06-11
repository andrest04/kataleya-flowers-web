// Server-only: Appwrite complaints repository.
//
// Mirrors the Supabase complaints data layer: admin reads (`getComplaints`,
// `getComplaintById`) and the public anonymous insert. The Supabase RPC
// `create_complaint` (SECURITY DEFINER) is replaced by two server-side steps
// using the admin client: an ATOMIC correlativo allocation via
// `incrementDocumentAttribute` (no read-then-write race), then a document
// insert. Anonymous callers never touch the counter directly.
import { AppwriteException, ID, Query } from 'node-appwrite';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type { ComplaintDoc, CounterDoc } from '@/lib/appwrite/types';

import { getRepositoryContext, listAllDocuments } from './shared';

const C = APPWRITE_COLLECTIONS;

/** Row shape mirroring Supabase `complaints` Row (snake_case, `id` not `$id`). */
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

/** Lists complaints newest-first — Appwrite equivalent of `getComplaints()`. */
export async function listComplaints(): Promise<ComplaintRepoRow[]> {
  const { databases, databaseId } = getRepositoryContext();

  const docs = await listAllDocuments<ComplaintDoc>(databases, databaseId, C.complaints, [
    Query.orderDesc('$createdAt'),
  ]);

  return docs.map(toComplaintRow);
}

/** Returns a single complaint by id, or null — `getComplaintById()`. */
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

/** Counter document id for a given year, e.g. `complaints-2026`. */
function counterDocId(year: number): string {
  return `complaints-${year}`;
}

/**
 * Atomically allocates the next correlativo for `year`, creating the year's
 * counter doc on first use. Uses `incrementDocumentAttribute` — a server-side
 * atomic read-modify-write — so concurrent submissions each receive a distinct,
 * gap-free value. Returns the post-increment value.
 */
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
    // Only handle "document not found" (404) — counter doc does not exist for
    // this year yet. All other errors (auth, network, etc.) must propagate.
    if (!(err instanceof AppwriteException) || err.code !== 404) throw err;

    // First submission of the year: create the counter seeded at 1.
    // Under concurrent year-rollover, multiple callers may reach this branch
    // simultaneously. The first createDocument succeeds; subsequent ones get
    // a 409 (document already exists). On 409, retry incrementDocumentAttribute
    // — the doc now exists and the increment will succeed atomically.
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
      // Another concurrent request created the doc first — increment normally.
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

/** Fields required to persist a new complaint (correlativo allocated separately). */
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

/** Minimal result mirroring the Supabase RPC return consumed by `submitComplaint`. */
export interface ComplaintCreated {
  id: string;
  correlativo: number;
  created_at: string;
}

/**
 * Persists a complaint document via the admin client and returns the created
 * id/correlativo/created_at — the Appwrite equivalent of the
 * `create_complaint` RPC result. Defaults match the Supabase column defaults
 * (`status='PENDIENTE'`, `email_sent=false`, no provider response yet).
 */
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
