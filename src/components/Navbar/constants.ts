export const primaryLinks = [
  { label: "Inicio", href: "#hero", isRoute: false },
  { label: "Catálogo", href: "/catalogo", isRoute: true },
] as const;

export const secondaryLinks = [
  { label: "Nosotros", href: "#nosotros", isRoute: false },
  { label: "Testimonios", href: "#testimonios", isRoute: false },
  { label: "Contacto", href: "#contacto", isRoute: false },
] as const;

export interface SearchResult {
  name: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  price: number;
  hasVariants: boolean;
  imageUrl: string;
}
