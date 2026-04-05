-- =============================================================================
-- Dynamic Product Colors — migrate from ENUM to lookup table
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Create product_colors lookup table
-- ---------------------------------------------------------------------------
CREATE TABLE product_colors (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL UNIQUE,
  label         text        NOT NULL,
  hex           text,
  display_order integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_product_colors_updated_at
  BEFORE UPDATE ON product_colors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Seed with current ENUM values
-- ---------------------------------------------------------------------------
INSERT INTO product_colors (name, label, hex, display_order) VALUES
  ('rojo',     'Rojo',     '#c0392b', 1),
  ('rosa',     'Rosa',     '#e91e8c', 2),
  ('amarillo', 'Amarillo', '#e8b84b', 3),
  ('blanco',   'Blanco',   '#e8e8e0', 4),
  ('morado',   'Morado',   '#7b1fa2', 5),
  ('naranja',  'Naranja',  '#ff6b2b', 6),
  ('verde',    'Verde',    '#2d5a1b', 7),
  ('mixto',    'Mixto',    NULL,      8);

-- ---------------------------------------------------------------------------
-- 3. Convert products.colors from ENUM[] to text[]
-- ---------------------------------------------------------------------------
ALTER TABLE products
  ALTER COLUMN colors DROP DEFAULT;

ALTER TABLE products
  ALTER COLUMN colors TYPE text[]
  USING colors::text[];

ALTER TABLE products
  ALTER COLUMN colors SET DEFAULT '{}';

DROP INDEX IF EXISTS idx_products_colors;
CREATE INDEX idx_products_colors ON products USING GIN (colors);

-- ---------------------------------------------------------------------------
-- 4. Drop the old ENUM type
-- ---------------------------------------------------------------------------
DROP TYPE product_color;

-- ---------------------------------------------------------------------------
-- 5. RLS policies
-- ---------------------------------------------------------------------------
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_product_colors"
  ON product_colors FOR SELECT TO anon USING (true);

CREATE POLICY "auth_read_product_colors"
  ON product_colors FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_insert_product_colors"
  ON product_colors FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_update_product_colors"
  ON product_colors FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_delete_product_colors"
  ON product_colors FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------------------------
-- 6. RPC: delete a product color (removes from all products atomically)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION delete_product_color(p_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET colors = array_remove(colors, p_name)
  WHERE p_name = ANY(colors);

  DELETE FROM product_colors WHERE name = p_name;
END;
$$;

-- ---------------------------------------------------------------------------
-- 7. RPC: rename a product color (propagates to all products atomically)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION rename_product_color(p_old_name text, p_new_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET colors = array_replace(colors, p_old_name, p_new_name)
  WHERE p_old_name = ANY(colors);

  UPDATE product_colors SET name = p_new_name WHERE name = p_old_name;
END;
$$;

-- ---------------------------------------------------------------------------
-- 8. RPC: get products that use a specific color (for delete confirmation)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_product_color_usage(p_name text)
RETURNS TABLE(product_id uuid, product_name text)
LANGUAGE sql STABLE
AS $$
  SELECT id, name
  FROM products
  WHERE p_name = ANY(colors);
$$;

-- ---------------------------------------------------------------------------
-- 9. Update get_color_distribution — remove ::text cast (now native text[])
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_color_distribution()
RETURNS TABLE(color_name text, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    unnest(colors) as color_name,
    COUNT(*) as count
  FROM products
  WHERE is_active = true
  GROUP BY 1;
$$;
