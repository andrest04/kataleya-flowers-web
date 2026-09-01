import {
  Clock,
  Flower2,
  Gift,
  Heart,
  type LucideIcon,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';

import {
  DEFAULT_DISCOVER_ICON,
  type DiscoverIconName,
} from '@/lib/discoverIcons';

const DISCOVER_ICON_MAP: Record<DiscoverIconName, LucideIcon> = {
  clock: Clock,
  flower2: Flower2,
  gift: Gift,
  heart: Heart,
  'map-pin': MapPin,
  'message-circle': MessageCircle,
  phone: Phone,
  'shield-check': ShieldCheck,
  sparkles: Sparkles,
  truck: Truck,
};

export function discoverIcon(name: string): LucideIcon {
  if (name in DISCOVER_ICON_MAP) return DISCOVER_ICON_MAP[name as DiscoverIconName];
  return DISCOVER_ICON_MAP[DEFAULT_DISCOVER_ICON];
}
