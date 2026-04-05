-- =============================================================================
-- Dynamic Flower Types — migrate from ENUM to lookup table
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Create flower_types lookup table
-- ---------------------------------------------------------------------------
CREATE TABLE flower_types (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL UNIQUE,
  display_order integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_flower_types_updated_at
  BEFORE UPDATE ON flower_types
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Seed with current ENUM values
-- ---------------------------------------------------------------------------
INSERT INTO flower_types (name, display_order) VALUES
  ('rosas',        1),
  ('girasoles',    2),
  ('orquídeas',    3),
  ('astromelias',  4),
  ('lirios',       5),
  ('gerberas',     6),
  ('mixto',        7);

-- ---------------------------------------------------------------------------
-- 3. Convert products.flower_types from ENUM[] to text[]
-- ---------------------------------------------------------------------------
ALTER TABLE products
  ALTER COLUMN flower_types DROP DEFAULT;

ALTER TABLE products
  ALTER COLUMN flower_types TYPE text[]
  USING flower_types::text[];

ALTER TABLE products
  ALTER COLUMN flower_types SET DEFAULT '{}';

-- Recreate GIN index for the new column type
DROP INDEX IF EXISTS idx_products_flower_types;
CREATE INDEX idx_products_flower_types ON products USING GIN (flower_types);

-- ---------------------------------------------------------------------------
-- 4. Drop the old ENUM type
-- ---------------------------------------------------------------------------
DROP TYPE product_flower_type;

-- ---------------------------------------------------------------------------
-- 5. RLS policies for flower_types
-- ---------------------------------------------------------------------------
ALTER TABLE flower_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_flower_types"
  ON flower_types FOR SELECT TO anon USING (true);

CREATE POLICY "auth_read_flower_types"
  ON flower_types FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_insert_flower_types"
  ON flower_types FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_update_flower_types"
  ON flower_types FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_delete_flower_types"
  ON flower_types FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------------------------
-- 6. RPC: delete a flower type (removes from all products atomically)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION delete_flower_type(p_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET flower_types = array_remove(flower_types, p_name)
  WHERE p_name = ANY(flower_types);

  DELETE FROM flower_types WHERE name = p_name;
END;
$$;

-- ---------------------------------------------------------------------------
-- 7. RPC: rename a flower type (propagates to all products atomically)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION rename_flower_type(p_old_name text, p_new_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET flower_types = array_replace(flower_types, p_old_name, p_new_name)
  WHERE p_old_name = ANY(flower_types);

  UPDATE flower_types SET name = p_new_name WHERE name = p_old_name;
END;
$$;

-- ---------------------------------------------------------------------------
-- 8. RPC: get products that use a specific flower type (for delete confirmation)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_flower_type_usage(p_name text)
RETURNS TABLE(product_id uuid, product_name text)
LANGUAGE sql STABLE
AS $$
  SELECT id, name
  FROM products
  WHERE p_name = ANY(flower_types);
$$;

-- ---------------------------------------------------------------------------
-- 9. Update get_flower_type_distribution — remove ::text cast (now native text[])
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_flower_type_distribution()
RETURNS TABLE(flower_type text, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    unnest(flower_types) as flower_type,
    COUNT(*) as count
  FROM products
  WHERE is_active = true
  GROUP BY 1;
$$;
