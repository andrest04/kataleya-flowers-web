import { createStaticClient } from "@/lib/supabase/static";

/**
 * Datos mínimos por producto que el sitemap necesita:
 * - slug del producto
 * - slug de la categoría (para construir la URL anidada)
 * - updated_at para el `lastModified`
 *
 * Esta query existe específicamente para `app/sitemap.ts`. No expone el shape
 * completo de `Product` porque el sitemap no lo necesita y queremos mantener
 * el payload lo más liviano posible.
 */
export interface SitemapProduct {
  slug: string;
  categorySlug: string;
  updatedAt: string | null;
}

export async function getSitemapProducts(): Promise<SitemapProduct[]> {
  const supabase = createStaticClient();

  // !inner garantiza que solo se devuelvan productos con categoría activa
  const { data, error } = await supabase
    .from("products")
    .select("slug, updated_at, categories!inner(slug, is_active)")
    .eq("is_active", true)
    .eq("categories.is_active", true)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`getSitemapProducts failed: ${error.message}`);
  }

  const rows = data ?? [];

  return rows.flatMap((row): SitemapProduct[] => {
    // Supabase tipa la relación como array u objeto según la inferencia.
    // Normalizamos a un único objeto.
    const rawCategory: unknown = (row as { categories: unknown }).categories;
    const category = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;

    if (!category || typeof category !== "object") {
      return [];
    }

    const categorySlug = (category as { slug?: unknown }).slug;
    if (typeof categorySlug !== "string") {
      return [];
    }

    return [
      {
        slug: row.slug,
        categorySlug,
        updatedAt: row.updated_at,
      },
    ];
  });
}
