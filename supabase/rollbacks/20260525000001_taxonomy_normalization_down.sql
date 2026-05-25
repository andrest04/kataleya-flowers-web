-- =============================================================================
-- DOWN migration for 20260525000001_taxonomy_normalization.sql
--
-- PURPOSE: Rollback Phase B. Rebuilds the legacy array columns and scalar
-- image_url on the products table from the relational data, then drops the
-- three new tables and the set_product_taxonomy RPC.
--
-- STATUS: UN-APPLIED — for rollback use only.
--
-- USAGE (after supabase start):
--   npx supabase db execute --file supabase/migrations/20260525000001_taxonomy_normalization_down.sql
--   -- or paste into Supabase Studio SQL editor.
--
-- SAFETY NOTE: This is destructive to the new tables. Run only when you intend
-- to fully roll back Phase B. The legacy array columns on products remain
-- intact (they were never dropped in Phase B), so rollback is lossless.
-- =============================================================================

-- ── Step 1: Rebuild legacy array columns from relational data ─────────────────
-- This ensures products.colors[] / flower_types[] / image_url / images[] are
-- consistent with the junction tables before we drop those tables.
-- (These columns still exist because Phase D — the destructive DROP — is deferred.)

-- Rebuild products.colors[] from product_color_assignments
UPDATE products p
SET colors = COALESCE((
  SELECT array_agg(pc.name ORDER BY pc.display_order)
  FROM product_color_assignments pca
  JOIN product_colors pc ON pc.id = pca.color_id
  WHERE pca.product_id = p.id
), '{}');

-- Rebuild products.flower_types[] from product_flower_type_assignments
UPDATE products p
SET flower_types = COALESCE((
  SELECT array_agg(ft.name ORDER BY ft.display_order)
  FROM product_flower_type_assignments pfta
  JOIN flower_types ft ON ft.id = pfta.flower_type_id
  WHERE pfta.product_id = p.id
), '{}');

-- Rebuild products.image_url (primary) and products.images[] (non-primary gallery)
UPDATE products p
SET
  image_url = (
    SELECT url
    FROM product_images pi
    WHERE pi.product_id = p.id AND pi.is_primary
    LIMIT 1
  ),
  images = COALESCE((
    SELECT array_agg(url ORDER BY display_order)
    FROM product_images pi
    WHERE pi.product_id = p.id AND NOT pi.is_primary
  ), '{}');

-- ── Step 2: Drop the set_product_taxonomy RPC ─────────────────────────────────
DROP FUNCTION IF EXISTS public.set_product_taxonomy(uuid, uuid[], uuid[], jsonb);

-- ── Step 3: Drop the three new tables (cascades RLS policies + indexes) ───────
-- Order matters: drop junction tables before product_images is fine since they
-- reference products, not each other.
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS product_flower_type_assignments;
DROP TABLE IF EXISTS product_color_assignments;
