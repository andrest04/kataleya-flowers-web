import { type ValueProp, valuePropRepository } from '@/lib/database/repositories/valueProps';

export type { ValueProp };

export async function getAdminValueProps(): Promise<ValueProp[]> {
  return valuePropRepository.list();
}

export async function getAdminValuePropById(id: string): Promise<ValueProp | null> {
  return valuePropRepository.findById(id);
}
