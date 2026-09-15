import { unstable_cache } from 'next/cache';

import { taxonomyRepository } from '@/lib/database/repositories/taxonomy';

const getCachedFlowerTypes = unstable_cache(
  async () => {
    const rows = await taxonomyRepository.listFlowerTypes();
    return rows.map(({ name }) => ({ name }));
  },
  ['catalog-flower-types'],
  { tags: ['catalog-flower-types'], revalidate: 3600 },
);

export async function getFlowerTypes(): Promise<{ name: string }[]> {
  return getCachedFlowerTypes();
}
