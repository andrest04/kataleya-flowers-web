import { isAppwriteBackend } from '@/lib/appwrite/config';
import {
  findComplaintById as findComplaintByIdAppwrite,
  listComplaints as listComplaintsAppwrite,
} from '@/lib/appwrite/repositories/complaints';
import { createClient } from '@/lib/supabase/server';

import type { ComplaintRow } from '../types';

/** Lista de reclamos para el panel admin (más recientes primero). */
export async function getComplaints(): Promise<ComplaintRow[]> {
  if (isAppwriteBackend()) {
    const rows = await listComplaintsAppwrite();
    return rows as unknown as ComplaintRow[];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Reclamo individual por id (admin). */
export async function getComplaintById(id: string): Promise<ComplaintRow | null> {
  if (isAppwriteBackend()) {
    const row = await findComplaintByIdAppwrite(id);
    return row as unknown as ComplaintRow | null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}
