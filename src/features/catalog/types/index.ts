export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  occasion?: string; // e.g. "Cumpleaños", "Amor", "Condolencias"
  imageUrl?: string;
  priceFrom?: number; // "Desde S/XXX" for category cards
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
}
