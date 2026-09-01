export const VALUE_PROP_ICON_NAMES = [
  'flower',
  'flower2',
  'sprout',
  'clock',
  'map-pin',
  'heart',
  'gift',
  'sparkles',
  'phone',
  'truck',
] as const;

export type ValuePropIconName = (typeof VALUE_PROP_ICON_NAMES)[number];

export const DEFAULT_VALUE_PROP_ICON: ValuePropIconName = 'flower2';

export const VALUE_PROP_ICON_LABELS: Record<ValuePropIconName, string> = {
  clock: 'Horario',
  flower: 'Flor',
  flower2: 'Flores',
  gift: 'Regalo',
  heart: 'Amor',
  'map-pin': 'Ubicación',
  phone: 'Teléfono',
  sparkles: 'Brillo',
  sprout: 'Brote',
  truck: 'Entrega',
};

export function isValuePropIconName(value: string): value is ValuePropIconName {
  return (VALUE_PROP_ICON_NAMES as readonly string[]).includes(value);
}
