import type { AdminSupabaseClient } from '@/features/admin/utils/auth';

interface ImageInput {
  url: string;
  isPrimary: boolean;
  displayOrder: number;
  altText: string;
}

interface TaxonomySyncInput {
  productId: string;
  productName: string;
  colorNames: string[];
  flowerTypeNames: string[];
  imageUrl: string;
  galleryImages: string[];
}

/**
 * Resolves taxonomy names → ids and calls the set_product_taxonomy RPC.
 *
 * The RPC handles the full replace atomically inside a Postgres transaction:
 *   1. Deletes existing product_color_assignments for the product
 *   2. Inserts new color assignments
 *   3. Deletes existing product_flower_type_assignments for the product
 *   4. Inserts new flower-type assignments
 *   5. Deletes existing product_images for the product
 *   6. Inserts new image rows (primary + gallery)
 *
 * This keeps actions/products.ts under the 100-line discipline.
 */
export async function syncTaxonomy(
  supabase: AdminSupabaseClient,
  input: TaxonomySyncInput,
): Promise<{ error: { code: string; message: string } } | null> {
  const { productId, productName, colorNames, flowerTypeNames, imageUrl, galleryImages } = input;

  // ── 1. Resolve color names → ids ──────────────────────────────────────────
  let colorIds: string[] = [];
  if (colorNames.length > 0) {
    const { data: colors, error: colorErr } = await supabase
      .from('product_colors')
      .select('id, name')
      .in('name', colorNames);
    if (colorErr) {
      return { error: { code: 'INTERNAL', message: `Failed to resolve color ids: ${colorErr.message}` } };
    }
    colorIds = (colors ?? []).map((c) => c.id);
  }

  // ── 2. Resolve flower type names → ids ────────────────────────────────────
  let flowerIds: string[] = [];
  if (flowerTypeNames.length > 0) {
    const { data: flowers, error: flowerErr } = await supabase
      .from('flower_types')
      .select('id, name')
      .in('name', flowerTypeNames);
    if (flowerErr) {
      return { error: { code: 'INTERNAL', message: `Failed to resolve flower type ids: ${flowerErr.message}` } };
    }
    flowerIds = (flowers ?? []).map((f) => f.id);
  }

  // ── 3. Build images jsonb ─────────────────────────────────────────────────
  // Primary image at display_order 0, gallery at 1..n.
  // Deduplicate: if a gallery URL equals the primary, skip it.
  const images: ImageInput[] = [];
  if (imageUrl) {
    images.push({ url: imageUrl, isPrimary: true, displayOrder: 0, altText: productName });
  }
  galleryImages.forEach((url, i) => {
    if (url !== imageUrl) {
      images.push({ url, isPrimary: false, displayOrder: i + 1, altText: productName });
    }
  });

  // Map to the jsonb shape the RPC expects
  const imagesJsonb = images.map((img) => ({
    url: img.url,
    alt_text: img.altText,
    is_primary: img.isPrimary,
    display_order: img.displayOrder,
  }));

  // ── 4. Call the RPC ───────────────────────────────────────────────────────
  const { error: rpcError } = await supabase.rpc('set_product_taxonomy', {
    p_product_id: productId,
    p_color_ids: colorIds,
    p_flower_ids: flowerIds,
    p_images: imagesJsonb,
  });

  if (rpcError) {
    return { error: { code: 'INTERNAL', message: `set_product_taxonomy failed: ${rpcError.message}` } };
  }

  return null;
}
