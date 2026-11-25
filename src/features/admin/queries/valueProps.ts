import { requireAdmin } from '@/features/admin/utils/auth';
import { type ValueProp, valuePropRepository } from '@/lib/database/repositories/valueProps';

export type { ValueProp };

export async function getAdminValueProps(): Promise<ValueProp[]> {
  await requireAdmin();
  return valuePropRepository.list();
}

export async function getAdminValuePropById(id: string): Promise<ValueProp | null> {
  await requireAdmin();
  return valuePropRepository.findById(id);
}
