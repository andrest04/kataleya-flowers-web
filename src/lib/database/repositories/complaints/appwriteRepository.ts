import { randomUUID } from 'node:crypto';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/ids';
import type { CreateOptions, DocumentRecord, DocumentStore } from '@/lib/database/types';

import type {
  Complaint,
  ComplaintCreated,
  ComplaintInsert,
  ComplaintsRepository,
  ComplaintStatusUpdate,
} from './types';

const COLLECTION_ID = APPWRITE_COLLECTIONS.complaints;
const COUNTERS_COLLECTION_ID = APPWRITE_COLLECTIONS.counters;
const COUNTER_ATTRIBUTE = 'value';
const PRIVATE_DOCUMENT: CreateOptions = { permissions: [] };

interface ComplaintDocument extends DocumentRecord {
  correlativo: number;
  correlativo_year?: number | null;
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
}

function toComplaint(doc: ComplaintDocument): Complaint {
  return {
    id: doc.id,
    correlativo: doc.correlativo,
    correlativoYear: doc.correlativo_year ?? null,
    complaintType: doc.complaint_type,
    consumerName: doc.consumer_name,
    consumerDocType: doc.consumer_doc_type,
    consumerDocNumber: doc.consumer_doc_number,
    consumerEmail: doc.consumer_email,
    consumerPhone: doc.consumer_phone,
    consumerAddress: doc.consumer_address,
    isMinor: doc.is_minor,
    guardianName: doc.guardian_name,
    itemType: doc.item_type,
    itemDescription: doc.item_description,
    claimedAmount: doc.claimed_amount,
    detail: doc.detail,
    consumerRequest: doc.consumer_request,
    providerResponse: doc.provider_response,
    status: doc.status,
    respondedAt: doc.responded_at,
    emailSent: doc.email_sent,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toDocumentData(input: ComplaintInsert): Record<string, unknown> {
  return {
    correlativo: input.correlativo,
    correlativo_year: input.correlativoYear,
    complaint_type: input.complaintType,
    consumer_name: input.consumerName,
    consumer_doc_type: input.consumerDocType,
    consumer_doc_number: input.consumerDocNumber,
    consumer_email: input.consumerEmail,
    consumer_phone: input.consumerPhone,
    consumer_address: input.consumerAddress,
    is_minor: input.isMinor,
    guardian_name: input.guardianName,
    item_type: input.itemType,
    item_description: input.itemDescription,
    claimed_amount: input.claimedAmount,
    detail: input.detail,
    consumer_request: input.consumerRequest,
    provider_response: null,
    status: 'PENDIENTE',
    responded_at: null,
    email_sent: false,
  };
}

function counterDocId(year: number): string {
  return `complaints-${year}`;
}

export function createComplaintsRepository(store: DocumentStore): ComplaintsRepository {
  return {
    async list(): Promise<Complaint[]> {
      const docs = await store.listAll<ComplaintDocument>(COLLECTION_ID);
      return [...docs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(toComplaint);
    },

    async findById(id: string): Promise<Complaint | null> {
      const doc = await store.getById<ComplaintDocument>(COLLECTION_ID, id);
      return doc ? toComplaint(doc) : null;
    },

    async allocateCorrelativo(year: number): Promise<number> {
      return store.increment(COUNTERS_COLLECTION_ID, counterDocId(year), COUNTER_ATTRIBUTE, 1, {});
    },

    async insert(input: ComplaintInsert): Promise<ComplaintCreated> {
      const id = randomUUID();
      const doc = await store.create<ComplaintDocument>(
        COLLECTION_ID,
        id,
        toDocumentData(input),
        PRIVATE_DOCUMENT,
      );
      return {
        id: doc.id,
        correlativo: doc.correlativo,
        correlativoYear: doc.correlativo_year ?? null,
        createdAt: doc.createdAt,
      };
    },

    async updateStatus(id: string, data: ComplaintStatusUpdate): Promise<void> {
      await store.update<ComplaintDocument>(COLLECTION_ID, id, {
        status: data.status,
        provider_response: data.providerResponse,
        responded_at: data.respondedAt,
      });
    },

    async markEmailSent(id: string): Promise<void> {
      await store.update<ComplaintDocument>(COLLECTION_ID, id, { email_sent: true });
    },
  };
}
