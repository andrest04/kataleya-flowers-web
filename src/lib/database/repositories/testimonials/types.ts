import type { OrderableRecord } from '@/lib/database/orderableCollection/types';

export interface Testimonial extends OrderableRecord {
  endsAt: string | null;
  name: string;
  occasion: string;
  photoAlt: string;
  photoUrl: string;
  quote: string;
  stars: number;
  startsAt: string | null;
}

export interface TestimonialWritePayload {
  displayOrder: number;
  endsAt: string | null;
  isActive: boolean;
  name: string;
  occasion: string;
  photoAlt: string;
  photoUrl: string;
  quote: string;
  stars: number;
  startsAt: string | null;
}
