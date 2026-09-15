import { randomUUID } from 'node:crypto';

import type { Models } from 'node-appwrite';
import { AppwriteException } from 'node-appwrite';

import { createAdminClient } from '@/lib/appwrite/admin';
import { getAppwriteConfig } from '@/lib/appwrite/config';
import type { DocumentRecord, DocumentStore } from '@/lib/database/types';

import type {
  Complaint,
  ComplaintCreated,
  ComplaintInsert,
  ComplaintsRepository,
  ComplaintStatusUpdate,
} from './types';

const COLLECTION_ID = 'complaints';
const COUNTERS_COLLECTION_ID = 'counters';
const COUNTER_ATTRIBUTE = 'value';

interface ComplaintDocument extends DocumentRecord {
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
}

interface CounterDocument extends Models.Document {
  value: number;
}

function toComplaint(doc: ComplaintDocument): Complaint {
  return {
    id: doc.id,
    correlativo: doc.correlativo,
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

function isAppwriteErrorWithCode(error: unknown, code: number): boolean {
  return error instanceof AppwriteException && error.code === code;
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
      const { databases } = createAdminClient();
      const { databaseId } = getAppwriteConfig();
      const documentId = counterDocId(year);

      try {
        const updated = await databases.incrementDocumentAttribute<CounterDocument>({
          databaseId,
          collectionId: COUNTERS_COLLECTION_ID,
          documentId,
          attribute: COUNTER_ATTRIBUTE,
          value: 1,
        });
        return updated.value;
      } catch (error) {
        if (!isAppwriteErrorWithCode(error, 404)) throw error;

        try {
          const created = await databases.createDocument<CounterDocument>({
            databaseId,
            collectionId: COUNTERS_COLLECTION_ID,
            documentId,
            data: { value: 1 },
          });
          return created.value;
        } catch (createError) {
          if (!isAppwriteErrorWithCode(createError, 409)) throw createError;

          const retried = await databases.incrementDocumentAttribute<CounterDocument>({
            databaseId,
            collectionId: COUNTERS_COLLECTION_ID,
            documentId,
            attribute: COUNTER_ATTRIBUTE,
            value: 1,
          });
          return retried.value;
        }
      }
    },

    async insert(input: ComplaintInsert): Promise<ComplaintCreated> {
      const id = randomUUID();
      const doc = await store.create<ComplaintDocument>(COLLECTION_ID, id, toDocumentData(input));
      return { id: doc.id, correlativo: doc.correlativo, createdAt: doc.createdAt };
    },

    async updateStatus(id: string, data: ComplaintStatusUpdate): Promise<void> {
      await store.update<ComplaintDocument>(COLLECTION_ID, id, {
        status: data.status,
        provider_response: data.providerResponse,
        responded_at: data.respondedAt,
      });
    },
  };
}
