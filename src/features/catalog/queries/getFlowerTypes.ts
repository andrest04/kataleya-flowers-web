import { listFlowerTypes } from '@/lib/appwrite/repositories/taxonomy';

export async function getFlowerTypes(): Promise<{ name: string }[]> {
  const rows = await listFlowerTypes();
  return rows.map(({ name }) => ({ name }));
}
