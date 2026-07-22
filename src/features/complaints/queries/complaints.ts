import {
  findComplaintById as findComplaintByIdAppwrite,
  listComplaints as listComplaintsAppwrite,
} from '@/lib/appwrite/repositories/complaints';

import type { ComplaintRow } from '../types';

export async function getComplaints(): Promise<ComplaintRow[]> {
  const rows = await listComplaintsAppwrite();
  return rows as unknown as ComplaintRow[];
}

export async function getComplaintById(id: string): Promise<ComplaintRow | null> {
  const row = await findComplaintByIdAppwrite(id);
  return row as unknown as ComplaintRow | null;
}
