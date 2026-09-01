import { findValuePropById, listValueProps } from '@/lib/appwrite/repositories/valueProps';
import type { ValuePropRow } from '@/lib/db/rows';

export async function getAdminValueProps(): Promise<ValuePropRow[]> {
  return listValueProps();
}

export async function getAdminValuePropById(id: string): Promise<ValuePropRow | null> {
  return findValuePropById(id);
}
