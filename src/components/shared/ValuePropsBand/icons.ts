import {
  Clock,
  Flower,
  Flower2,
  Gift,
  Heart,
  type LucideIcon,
  MapPin,
  Phone,
  Sparkles,
  Sprout,
  Truck,
} from 'lucide-react';

import {
  DEFAULT_VALUE_PROP_ICON,
  type ValuePropIconName,
} from '@/lib/valuePropIcons';

const VALUE_PROP_ICON_MAP: Record<ValuePropIconName, LucideIcon> = {
  clock: Clock,
  flower: Flower,
  flower2: Flower2,
  gift: Gift,
  heart: Heart,
  'map-pin': MapPin,
  phone: Phone,
  sparkles: Sparkles,
  sprout: Sprout,
  truck: Truck,
};

export function valuePropIcon(name: string): LucideIcon {
  if (name in VALUE_PROP_ICON_MAP) return VALUE_PROP_ICON_MAP[name as ValuePropIconName];
  return VALUE_PROP_ICON_MAP[DEFAULT_VALUE_PROP_ICON];
}
