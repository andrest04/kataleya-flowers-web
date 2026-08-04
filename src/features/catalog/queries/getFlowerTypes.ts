import { unstable_cache } from 'next/cache';

import { listFlowerTypes } from '@/lib/appwrite/repositories/taxonomy';

const getCachedFlowerTypes = unstable_cache(
  async () => {
    const rows = await listFlowerTypes();
    return rows.map(({ name }) => ({ name }));
  },
  ['catalog-flower-types'],
  { tags: ['catalog-flower-types'], revalidate: 3600 },
);

export async function getFlowerTypes(): Promise<{ name: string }[]> {
  return getCachedFlowerTypes();
}
