import { appwriteDocumentStore } from './appwriteProvider';
import type { DocumentStore } from './types';

export const documentStore: DocumentStore = appwriteDocumentStore;

export { ConflictError, isConflictError } from './errors';
export type {
  BulkUpdateOperation,
  DocumentRecord,
  DocumentStore,
  QuerySpec,
  TransactionHandle,
} from './types';
export { chunkIds } from './types';
