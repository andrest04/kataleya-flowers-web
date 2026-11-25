import { requireAdmin } from '@/lib/auth/admin';
import { complaintsRepository } from '@/lib/database/repositories/complaints';

import type { Complaint } from '../types';

export async function getComplaints(): Promise<Complaint[]> {
  await requireAdmin();
  return complaintsRepository.list();
}

export async function getComplaintById(id: string): Promise<Complaint | null> {
  await requireAdmin();
  return complaintsRepository.findById(id);
}
