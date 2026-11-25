import { requireAdmin } from '@/features/admin/utils/auth';
import { type ColorRepoRow, taxonomyRepository } from '@/lib/database/repositories/taxonomy';

export type { ColorRepoRow };

export async function getProductColors(): Promise<ColorRepoRow[]> {
  await requireAdmin();
  return taxonomyRepository.listColors();
}

export async function getProductColorUsage(
  name: string
): Promise<{ product_id: string; product_name: string }[]> {
  await requireAdmin();
  return taxonomyRepository.getColorUsage(name);
}
