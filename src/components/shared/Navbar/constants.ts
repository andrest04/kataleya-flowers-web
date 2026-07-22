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
