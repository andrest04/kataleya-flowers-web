import type { OrderableRecord } from '@/lib/database/orderableCollection/types';

export interface DiscoverTile extends OrderableRecord {
  description: string;
  endsAt: string | null;
  href: string;
  icon: string;
  imageUrl: string;
  isExternal: boolean;
  startsAt: string | null;
  title: string;
}

export interface DiscoverTileWritePayload {
  description: string;
  displayOrder: number;
  endsAt: string | null;
  href: string;
  icon: string;
  imageUrl: string;
  isActive: boolean;
  isExternal: boolean;
  startsAt: string | null;
  title: string;
}
