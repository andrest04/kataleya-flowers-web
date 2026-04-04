export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  occasion?: string; // e.g. "Cumpleaños", "Amor", "Condolencias"
  imageUrl?: string;
  priceFrom?: number; // "Desde S/XXX" for category cards
  isFeatured?: boolean;
}

export interface PriceVariant {
  label: string; // e.g. "12 rosas", "5 girasoles"
  price: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // fixed price or minimum price when priceTable exists
  priceTable?: PriceVariant[]; // variable pricing — show table in detail page
  categoryId: string;
  imageUrl: string;
  images?: string[]; // additional gallery images
  includes?: string[]; // e.g. ["24 rosas rojas", "Caja negra premium"]
  occasion?: string; // e.g. "Perfecto para San Valentín y aniversarios"
  note?: string; // e.g. "Incluye peluche"
  colors?: string[]; // e.g. ['amarillo', 'rojo']
  flowerTypes?: string[]; // e.g. ['rosas', 'girasoles']
}

export const PRODUCT_COLORS = [
  { value: 'rojo',     label: 'Rojo',     hex: '#c0392b' },
  { value: 'rosa',     label: 'Rosa',     hex: '#e91e8c' },
  { value: 'amarillo', label: 'Amarillo', hex: '#e8b84b' },
  { value: 'blanco',   label: 'Blanco',   hex: '#e8e8e0' },
  { value: 'morado',   label: 'Morado',   hex: '#7b1fa2' },
  { value: 'naranja',  label: 'Naranja',  hex: '#ff6b2b' },
  { value: 'verde',    label: 'Verde',    hex: '#2d5a1b' },
  { value: 'mixto',    label: 'Mixto',    hex: null },
] as const;

export const PRODUCT_FLOWER_TYPES = [
  'rosas',
  'girasoles',
  'orquídeas',
  'astromelias',
  'lirios',
  'gerberas',
  'mixto',
] as const;

export type ProductColor = (typeof PRODUCT_COLORS)[number]['value'];
export type ProductFlowerType = (typeof PRODUCT_FLOWER_TYPES)[number];
