import type { OrderableRecord } from '@/lib/database/orderableCollection/types';

export interface ValueProp extends OrderableRecord {
  description: string;
  endsAt: string | null;
  href: string;
  icon: string;
  isAnchor: boolean;
  isExternal: boolean;
  linkLabel: string;
  startsAt: string | null;
  title: string;
}

export interface ValuePropWritePayload {
  description: string;
  displayOrder: number;
  endsAt: string | null;
  href: string;
  icon: string;
  isActive: boolean;
  isAnchor: boolean;
  isExternal: boolean;
  linkLabel: string;
  startsAt: string | null;
  title: string;
}
