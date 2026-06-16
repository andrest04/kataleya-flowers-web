import type { ZodIssue } from 'zod';

import type { ComplaintRow } from '@/lib/db/rows';

import type {
  COMPLAINT_STATUSES,
  COMPLAINT_TYPES,
  DOC_TYPES,
  ITEM_TYPES,
} from './schemas/complaint';

export type { ComplaintRow };

export type ComplaintType = (typeof COMPLAINT_TYPES)[number];
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];
export type DocType = (typeof DOC_TYPES)[number];
export type ItemType = (typeof ITEM_TYPES)[number];

/** Resultado de la action pública de envío (no usa códigos de auth). */
export type ComplaintSubmitResult =
  | { success: true; complaintNumber: string; createdAt: string; emailSent: boolean }
  | {
      success: false;
      error: string;
      code: 'VALIDATION' | 'INTERNAL';
      issues?: ZodIssue[];
    };
