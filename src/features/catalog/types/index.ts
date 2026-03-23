export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  occasion?: string; // e.g. "Cumpleaños", "Amor", "Condolencias"
  imageUrl?: string;
  priceFrom?: number; // "Desde S/XXX" for category cards
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  includes?: string[]; // e.g. ["24 rosas rojas", "Caja negra premium", "Lazo satinado"]
  occasion?: string; // e.g. "Perfecto para San Valentín y aniversarios"
}
