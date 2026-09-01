export const DISCOVER_ICON_NAMES = [
  'truck',
  'message-circle',
  'shield-check',
  'heart',
  'gift',
  'flower2',
  'sparkles',
  'clock',
  'map-pin',
  'phone',
] as const;

export type DiscoverIconName = (typeof DISCOVER_ICON_NAMES)[number];

export const DEFAULT_DISCOVER_ICON: DiscoverIconName = 'flower2';

export const DISCOVER_ICON_LABELS: Record<DiscoverIconName, string> = {
  clock: 'Horario',
  flower2: 'Flores',
  gift: 'Regalo',
  heart: 'Amor',
  'map-pin': 'Ubicación',
  'message-circle': 'WhatsApp',
  phone: 'Teléfono',
  'shield-check': 'Garantía',
  sparkles: 'Brillo',
  truck: 'Entrega',
};

export function isDiscoverIconName(value: string): value is DiscoverIconName {
  return (DISCOVER_ICON_NAMES as readonly string[]).includes(value);
}
