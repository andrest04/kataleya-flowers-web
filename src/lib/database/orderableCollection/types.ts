import type { DocumentRecord } from '../types';

export interface OrderableRecord {
  id: string;
  displayOrder: number;
  isActive: boolean;
}

export interface OrderableCollectionConfig<TRow extends OrderableRecord, TWrite> {
  collectionId: string;
  assetUrlField?: keyof TRow;
  toRow(doc: DocumentRecord & Record<string, unknown>): TRow;
  toDocumentData(payload: TWrite): Record<string, unknown>;
}

export interface OrderableCollectionRepository<TRow extends OrderableRecord, TWrite> {
  list(): Promise<TRow[]>;
  findById(id: string): Promise<TRow | null>;
  getNextOrder(): Promise<number>;
  create(payload: TWrite): Promise<string>;
  update(id: string, payload: TWrite): Promise<void>;
  setActive(id: string, isActive: boolean): Promise<void>;
  delete(id: string): Promise<string | null>;
  reorder(orderedIds: string[]): Promise<void>;
}
