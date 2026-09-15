import { complaintsRepository } from '@/lib/database/repositories/complaints';

import type { Complaint } from '../types';

export async function getComplaints(): Promise<Complaint[]> {
  return complaintsRepository.list();
}

export async function getComplaintById(id: string): Promise<Complaint | null> {
  return complaintsRepository.findById(id);
}
