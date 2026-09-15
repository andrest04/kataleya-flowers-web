import { unstable_cache } from 'next/cache';

import { taxonomyRepository } from '@/lib/database/repositories/taxonomy';

const getCachedProductColors = unstable_cache(
  async () => {
    const rows = await taxonomyRepository.listColors();
    return rows.map(({ name, label, hex }) => ({ name, label, hex }));
  },
  ['catalog-product-colors'],
  { tags: ['catalog-colors'], revalidate: 3600 },
);

export async function getProductColors(): Promise<{ name: string; label: string; hex: string | null }[]> {
  return getCachedProductColors();
}
