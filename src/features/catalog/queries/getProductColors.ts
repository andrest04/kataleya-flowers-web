import { listColors } from '@/lib/appwrite/repositories/taxonomy';

export async function getProductColors(): Promise<{ name: string; label: string; hex: string | null }[]> {
  const rows = await listColors();
  return rows.map(({ name, label, hex }) => ({ name, label, hex }));
}
