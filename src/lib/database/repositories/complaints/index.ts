import { documentStore } from '@/lib/database';

import { createComplaintsRepository } from './appwriteRepository';

export const complaintsRepository = createComplaintsRepository(documentStore);

export type {
  Complaint,
  ComplaintCreated,
  ComplaintInsert,
  ComplaintsRepository,
  ComplaintStatusUpdate,
} from './types';
