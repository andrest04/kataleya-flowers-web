// Re-export desde la fuente única (`@/lib/navigation`) para mantener compatibilidad
// con los imports existentes del Navbar/MobileDrawer.
export { primaryLinks, secondaryLinks } from "@/lib/navigation";

export interface SearchResult {
  name: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  price: number;
  hasVariants: boolean;
  imageUrl: string;
}
