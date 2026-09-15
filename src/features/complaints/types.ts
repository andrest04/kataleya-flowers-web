import type { ZodIssue } from 'zod';

import type { Complaint } from '@/lib/database/repositories/complaints';

import type {
  COMPLAINT_STATUSES,
  COMPLAINT_TYPES,
  DOC_TYPES,
  ITEM_TYPES,
} from './schemas/complaint';

export type { Complaint };

export type ComplaintType = (typeof COMPLAINT_TYPES)[number];
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];
export type DocType = (typeof DOC_TYPES)[number];
export type ItemType = (typeof ITEM_TYPES)[number];

export type ComplaintSubmitResult =
  | { success: true; complaintNumber: string; createdAt: string; emailSent: boolean }
  | {
      success: false;
      error: string;
      code: 'VALIDATION' | 'INTERNAL' | 'RATE_LIMITED';
      issues?: ZodIssue[];
    };
