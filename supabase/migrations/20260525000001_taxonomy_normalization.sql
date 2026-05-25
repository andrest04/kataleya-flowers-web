-- =============================================================================
-- Product taxonomy normalization — Phase B: additive tables + RLS + backfill
-- + set_product_taxonomy RPC
--
-- STATUS: UN-APPLIED — Docker/Supabase local not running at time of writing.
-- See "Human Apply Steps" at the bottom of this file.
--
-- PREREQUISITE (B-1 Orphan Audit): run the orphan-audit queries below against
-- the local DB BEFORE applying this migration. If any orphan rows are returned,
-- STOP and fix them manually. Only apply when both queries return 0 rows.
--
-- Orphan audit queries:
--   -- Colors with no matching master row:
--   SELECT p.id, p.name, cname
--   FROM products p
--   CROSS JOIN LATERAL unnest(p.colors) AS cname
--   WHERE NOT EXISTS (SELECT 1 FROM product_colors pc WHERE pc.name = cname);
--
--   -- Flower types with no matching master row:
--   SELECT p.id, p.name, fname
--   FROM products p
--   CROSS JOIN LATERAL unnest(p.flower_types) AS fname
--   WHERE NOT EXISTS (SELECT 1 FROM flower_types ft WHERE ft.name = fname);
--
-- ROLLBACK (DOWN migration): See the paired file
--   supabase/migrations/20260525000001_taxonomy_normalization_down.sql
-- =============================================================================

-- ── product_color_assignments ────────────────────────────────────────────────
-- Junction between products and product_colors.
-- PK(product_id, color_id) ensures uniqueness.
-- CASCADE on product delete; RESTRICT on color delete (blocks delete when in use).
CREATE TABLE product_color_assignments (
  product_id uuid NOT NULL REFERENCES products(id)        ON DELETE CASCADE,
  color_id   uuid NOT NULL REFERENCES product_colors(id)  ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, color_id)
);

-- Reverse-direction index for FK lookup efficiency (RESTRICT check + usage counts).
CREATE INDEX idx_pca_color_id ON product_color_assignments (color_id);

-- ── product_flower_type_assignments ──────────────────────────────────────────
-- Junction between products and flower_types.
CREATE TABLE product_flower_type_assignments (
  product_id     uuid NOT NULL REFERENCES products(id)      ON DELETE CASCADE,
  flower_type_id uuid NOT NULL REFERENCES flower_types(id)  ON DELETE RESTRICT,
  created_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, flower_type_id)
);

CREATE INDEX idx_pfta_flower_type_id ON product_flower_type_assignments (flower_type_id);

-- ── product_images ───────────────────────────────────────────────────────────
-- First-class image rows with ordering and SEO alt_text.
-- Replaces scalar image_url (is_primary=true, display_order=0) + images[] gallery.
-- UNIQUE(product_id, url) prevents duplicate gallery rows.
-- Partial unique on (product_id) WHERE is_primary enforces at-most-one primary.
CREATE TABLE product_images (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url           text        NOT NULL,
  alt_text      text,                          -- nullable; backfilled as product name
  is_primary    boolean     NOT NULL DEFAULT false,
  display_order integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, url)                     -- prevents dup gallery rows per product
);

-- Composite index for order-aware reads (product detail / mapper aggregation).
CREATE INDEX idx_product_images_product_id ON product_images (product_id, display_order);

-- Partial unique index: at most one primary image per product.
CREATE UNIQUE INDEX uq_product_images_primary
  ON product_images (product_id) WHERE is_primary;

-- Auto-update updated_at on row change (reuses set_updated_at() from initial schema).
CREATE TRIGGER trg_product_images_updated_at
  BEFORE UPDATE ON product_images
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Mirror the existing posture from 20260515000001_admin_authorization.sql:
--   • Public (anon+auth) read: active products only, gated via EXISTS on products.is_active.
--   • Admin read: authenticated + is_admin() — covers inactive products for the edit form.
--   • Admin write (INSERT/UPDATE/DELETE): authenticated + is_admin().

ALTER TABLE product_color_assignments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_flower_type_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images                  ENABLE ROW LEVEL SECURITY;

-- product_color_assignments
CREATE POLICY "public_read_pca"
  ON product_color_assignments FOR SELECT TO public
  USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.is_active));

-- Admin read includes inactive products (edit form needs taxonomy of inactive products).
-- TO public already covers anon+auth for active products; this adds inactive coverage.
CREATE POLICY "admin_read_pca"
  ON product_color_assignments FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "admin_write_pca_insert"
  ON product_color_assignments FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin_write_pca_delete"
  ON product_color_assignments FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- product_flower_type_assignments
CREATE POLICY "public_read_pfta"
  ON product_flower_type_assignments FOR SELECT TO public
  USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.is_active));

CREATE POLICY "admin_read_pfta"
  ON product_flower_type_assignments FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "admin_write_pfta_insert"
  ON product_flower_type_assignments FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin_write_pfta_delete"
  ON product_flower_type_assignments FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- product_images
CREATE POLICY "public_read_product_images"
  ON product_images FOR SELECT TO public
  USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.is_active));

CREATE POLICY "admin_read_product_images"
  ON product_images FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "admin_insert_product_images"
  ON product_images FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin_update_product_images"
  ON product_images FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin_delete_product_images"
  ON product_images FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- ── Idempotent Backfill ───────────────────────────────────────────────────────
-- PREREQUISITE: Orphan audit (queries at top of this file) MUST return 0 rows.
-- ON CONFLICT DO NOTHING makes this safe to re-run.

-- ── Hard-abort orphan guard ───────────────────────────────────────────────────
-- Enforced inside the migration transaction: if any color name or flower-type
-- name in products[] arrays has no matching master-table row the migration
-- RAISES an exception and rolls back ENTIRELY — no partial backfill, no silent
-- data loss. Fix the vocabulary tables (or the products arrays) and re-run.
DO $$
DECLARE
  v_orphan_colors      text;
  v_orphan_flower_types text;
BEGIN
  -- Collect DISTINCT color names that exist in products.colors[] but have no
  -- matching row in product_colors.name.
  SELECT string_agg(DISTINCT cname, ', ' ORDER BY cname)
  INTO   v_orphan_colors
  FROM   products p
  CROSS  JOIN LATERAL unnest(p.colors) AS cname
  WHERE  NOT EXISTS (
    SELECT 1 FROM product_colors pc WHERE pc.name = cname
  );

  -- Collect DISTINCT flower-type names that exist in products.flower_types[]
  -- but have no matching row in flower_types.name.
  SELECT string_agg(DISTINCT fname, ', ' ORDER BY fname)
  INTO   v_orphan_flower_types
  FROM   products p
  CROSS  JOIN LATERAL unnest(p.flower_types) AS fname
  WHERE  NOT EXISTS (
    SELECT 1 FROM flower_types ft WHERE ft.name = fname
  );

  -- Hard abort if ANY orphan is found.
  IF v_orphan_colors IS NOT NULL OR v_orphan_flower_types IS NOT NULL THEN
    RAISE EXCEPTION
      'TAXONOMY_BACKFILL_ABORTED: orphan vocabulary names detected — backfill would silently drop these assignments. '
      'Fix the data and re-run the migration. '
      'Orphan color names: [%]. '
      'Orphan flower-type names: [%]. '
      'To fix: either INSERT the missing names into product_colors / flower_types, '
      'or remove/correct the offending values from products.colors[] / products.flower_types[].',
      COALESCE(v_orphan_colors,      'none'),
      COALESCE(v_orphan_flower_types, 'none')
    USING ERRCODE = 'P0001';
  END IF;

  RAISE NOTICE 'Orphan guard passed — no orphan color or flower-type names found.';
END $$;

-- Colors: join product.colors[] to product_colors.name
INSERT INTO product_color_assignments (product_id, color_id)
SELECT p.id, pc.id
FROM products p
CROSS JOIN LATERAL unnest(p.colors) AS cname
JOIN product_colors pc ON pc.name = cname
ON CONFLICT (product_id, color_id) DO NOTHING;

-- Flower types: join product.flower_types[] to flower_types.name
INSERT INTO product_flower_type_assignments (product_id, flower_type_id)
SELECT p.id, ft.id
FROM products p
CROSS JOIN LATERAL unnest(p.flower_types) AS fname
JOIN flower_types ft ON ft.name = fname
ON CONFLICT (product_id, flower_type_id) DO NOTHING;

-- Images: union primary (image_url, order=0) + gallery (images[], order 1..n).
-- GROUP BY (product_id, url) deduplicates when image_url also appears in images[].
-- bool_or(is_primary) ensures the URL is marked primary when it appears in both.
-- min(ord) gives display_order=0 to the primary URL even if it is also in the gallery.
INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
SELECT
  product_id,
  url,
  p_name        AS alt_text,
  bool_or(is_primary)  AS is_primary,
  min(ord)             AS display_order
FROM (
  -- Primary image from scalar image_url
  SELECT
    p.id     AS product_id,
    p.image_url AS url,
    p.name   AS p_name,
    true     AS is_primary,
    0        AS ord
  FROM products p
  WHERE p.image_url IS NOT NULL AND p.image_url <> ''
  UNION ALL
  -- Gallery images from images[] with 1-based ordinal
  SELECT
    p.id,
    g.url,
    p.name,
    false,
    g.ord
  FROM products p
  CROSS JOIN LATERAL unnest(p.images) WITH ORDINALITY AS g(url, ord)
  WHERE g.url IS NOT NULL AND g.url <> ''
) src
GROUP BY product_id, url, p_name
ON CONFLICT (product_id, url) DO NOTHING;

-- Edge case: if a product had no image_url (NULL/empty) but has gallery images,
-- promote the lowest-order image to primary so every product with images has
-- exactly one primary row.
UPDATE product_images pi
SET is_primary = true
WHERE pi.display_order = (
  SELECT min(display_order)
  FROM product_images x
  WHERE x.product_id = pi.product_id
)
AND NOT EXISTS (
  SELECT 1
  FROM product_images y
  WHERE y.product_id = pi.product_id AND y.is_primary
);

-- ── Backfill Sanity Assertions ────────────────────────────────────────────────
-- These raise an exception and ROLL BACK the migration if backfill is lossy.
DO $$
DECLARE
  v_color_count bigint;
  v_flower_count bigint;
BEGIN
  SELECT count(*) INTO v_color_count FROM product_color_assignments;
  SELECT count(*) INTO v_flower_count FROM product_flower_type_assignments;

  RAISE NOTICE 'color assignments backfilled: %', v_color_count;
  RAISE NOTICE 'flower type assignments backfilled: %', v_flower_count;

  -- Every product that had an image source must now have >=1 image row.
  IF EXISTS (
    SELECT 1 FROM products p
    WHERE ((p.image_url IS NOT NULL AND p.image_url <> '')
       OR (p.images IS NOT NULL AND cardinality(p.images) > 0))
    AND NOT EXISTS (
      SELECT 1 FROM product_images pi WHERE pi.product_id = p.id
    )
  ) THEN
    RAISE EXCEPTION 'Backfill FAILED: at least one product lost all images';
  END IF;

  -- Every product with at least one image row must have EXACTLY one primary.
  IF EXISTS (
    SELECT product_id
    FROM product_images
    GROUP BY product_id
    HAVING count(*) FILTER (WHERE is_primary) <> 1
  ) THEN
    RAISE EXCEPTION 'Backfill FAILED: a product has zero or more than one primary image';
  END IF;

  RAISE NOTICE 'Backfill sanity assertions passed.';
END $$;

-- ── set_product_taxonomy RPC ──────────────────────────────────────────────────
-- Atomically replaces color assignments, flower-type assignments, and image rows
-- for a single product. Called by the admin write action (Phase C).
--
-- Auth: SECURITY DEFINER + PERFORM require_admin() — same pattern as reorder_products,
-- delete_category_cascade, etc. The caller must be an authenticated admin session;
-- the function enforces this via require_admin() before any DML.
--
-- Parameters:
--   p_product_id   uuid     — product to update
--   p_color_ids    uuid[]   — full replacement set of product_colors.id values
--   p_flower_ids   uuid[]   — full replacement set of flower_types.id values
--   p_images       jsonb    — ordered array of image objects:
--                             [{"url":"...", "alt_text":"...", "is_primary":true, "display_order":0}, ...]
--
-- Returns: void (caller checks Result<T> at action layer)
CREATE OR REPLACE FUNCTION public.set_product_taxonomy(
  p_product_id uuid,
  p_color_ids  uuid[],
  p_flower_ids uuid[],
  p_images     jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  img jsonb;
BEGIN
  -- Auth gate: raises 42501 'admin access required' if caller is not an admin.
  PERFORM public.require_admin();

  -- Verify product exists (raises if missing, rolling back safely).
  IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id) THEN
    RAISE EXCEPTION 'product not found: %', p_product_id
      USING ERRCODE = 'P0002';
  END IF;

  -- ── Color assignments: full replace ───────────────────────────────────────
  DELETE FROM product_color_assignments WHERE product_id = p_product_id;
  IF p_color_ids IS NOT NULL AND cardinality(p_color_ids) > 0 THEN
    INSERT INTO product_color_assignments (product_id, color_id)
    SELECT p_product_id, unnest(p_color_ids)
    ON CONFLICT (product_id, color_id) DO NOTHING;
  END IF;

  -- ── Flower type assignments: full replace ──────────────────────────────────
  DELETE FROM product_flower_type_assignments WHERE product_id = p_product_id;
  IF p_flower_ids IS NOT NULL AND cardinality(p_flower_ids) > 0 THEN
    INSERT INTO product_flower_type_assignments (product_id, flower_type_id)
    SELECT p_product_id, unnest(p_flower_ids)
    ON CONFLICT (product_id, flower_type_id) DO NOTHING;
  END IF;

  -- ── Images: full replace ───────────────────────────────────────────────────
  -- Callers should collect old URLs for Cloudinary cleanup BEFORE calling this RPC.
  DELETE FROM product_images WHERE product_id = p_product_id;
  IF p_images IS NOT NULL AND jsonb_array_length(p_images) > 0 THEN
    FOR img IN SELECT jsonb_array_elements(p_images)
    LOOP
      INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
      VALUES (
        p_product_id,
        (img->>'url'),
        NULLIF(img->>'alt_text', ''),
        COALESCE((img->>'is_primary')::boolean, false),
        COALESCE((img->>'display_order')::integer, 0)
      )
      ON CONFLICT (product_id, url) DO UPDATE
        SET alt_text      = EXCLUDED.alt_text,
            is_primary    = EXCLUDED.is_primary,
            display_order = EXCLUDED.display_order,
            updated_at    = now();
    END LOOP;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.set_product_taxonomy(uuid, uuid[], uuid[], jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_product_taxonomy(uuid, uuid[], uuid[], jsonb) TO authenticated;

-- =============================================================================
-- Post-migration verification queries (run manually — NOT part of the migration)
-- =============================================================================
-- These should all return 0 rows after a successful backfill:
--
-- 1. Products whose color count in the new table differs from resolvable array entries:
--    SELECT p.id, p.name,
--           cardinality(p.colors) AS arr_len,
--           count(pca.color_id) AS junction_len
--    FROM products p
--    LEFT JOIN product_color_assignments pca ON pca.product_id = p.id
--    GROUP BY p.id, p.name, p.colors
--    HAVING cardinality(COALESCE(p.colors, '{}')) <> count(pca.color_id);
--    -- Note: orphan names in p.colors[] (not in product_colors) will show as mismatch.
--    -- After a clean orphan audit, this should be 0 rows.
--
-- 2. Products whose flower-type count differs:
--    SELECT p.id, p.name,
--           cardinality(p.flower_types) AS arr_len,
--           count(pfta.flower_type_id) AS junction_len
--    FROM products p
--    LEFT JOIN product_flower_type_assignments pfta ON pfta.product_id = p.id
--    GROUP BY p.id, p.name, p.flower_types
--    HAVING cardinality(COALESCE(p.flower_types, '{}')) <> count(pfta.flower_type_id);
--
-- 3. Row count summary:
--    SELECT
--      (SELECT count(*) FROM product_color_assignments)       AS color_assignments,
--      (SELECT count(*) FROM product_flower_type_assignments)  AS flower_assignments,
--      (SELECT count(*) FROM product_images)                   AS image_rows,
--      (SELECT count(*) FROM product_images WHERE is_primary)  AS primary_images;
--
-- =============================================================================
-- Human Apply Steps
-- =============================================================================
-- 1. Start Docker Desktop and ensure it is running.
-- 2. In the project root: npx supabase start
-- 3. Run the ORPHAN AUDIT queries (at the top of this file) via:
--      npx supabase db execute --file /dev/stdin <<'SQL'
--        <paste orphan audit queries>
--      SQL
--    OR open the local Supabase Studio at http://localhost:54323 → SQL Editor.
--    If either query returns ANY rows: STOP, fix orphans, then retry.
-- 4. Only if audit returns 0 rows:
--      npx supabase migration up
--    OR: npx supabase db reset  (if you want a full reset with seed)
-- 5. Check RAISE NOTICE output for backfill row counts.
-- 6. Run the post-migration verification queries (section above).
-- 7. Regenerate Supabase TypeScript types:
--      npx supabase gen types typescript --local > src/lib/supabase/types.ts
--    (or: npm run db:types  if it is configured to point at local)
-- 8. Run tests: npx playwright test phase1-verify && npx playwright test catalog-taxonomy-baseline
-- 9. Run lint + type-check: npm run lint:strict && npx tsc --noEmit
-- =============================================================================
