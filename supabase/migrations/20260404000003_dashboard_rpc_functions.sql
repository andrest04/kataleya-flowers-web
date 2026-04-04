-- RPC functions for dashboard aggregation.
-- Moves COUNT/GROUP BY work from JS to Postgres.

-- 1. Inventory status: active, inactive, featured, total counts.
CREATE OR REPLACE FUNCTION get_inventory_status()
RETURNS TABLE(active bigint, inactive bigint, featured bigint, total bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    COUNT(*) FILTER (WHERE is_active) as active,
    COUNT(*) FILTER (WHERE NOT is_active) as inactive,
    COUNT(*) FILTER (WHERE is_featured) as featured,
    COUNT(*) as total
  FROM products;
$$;

-- 2. Products per category with active count.
CREATE OR REPLACE FUNCTION get_products_per_category()
RETURNS TABLE(category text, count bigint, active bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    c.name as category,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE p.is_active) as active
  FROM products p
  JOIN categories c ON p.category_id = c.id
  GROUP BY c.name
  ORDER BY count DESC;
$$;

-- 3. Price distribution with bucketed ranges.
CREATE OR REPLACE FUNCTION get_price_distribution()
RETURNS TABLE(range text, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    CASE
      WHEN price < 50 THEN 'S/0–50'
      WHEN price < 100 THEN 'S/50–100'
      WHEN price < 200 THEN 'S/100–200'
      WHEN price < 500 THEN 'S/200–500'
      ELSE 'S/500+'
    END as range,
    COUNT(*) as count
  FROM products
  GROUP BY 1
  ORDER BY MIN(price);
$$;

-- 4. Color distribution from array column (active products only).
CREATE OR REPLACE FUNCTION get_color_distribution()
RETURNS TABLE(color_name text, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    unnest(colors)::text as color_name,
    COUNT(*) as count
  FROM products
  WHERE is_active = true
  GROUP BY 1;
$$;

-- 5. Flower type distribution from array column (active products only).
CREATE OR REPLACE FUNCTION get_flower_type_distribution()
RETURNS TABLE(flower_type text, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    unnest(flower_types)::text as flower_type,
    COUNT(*) as count
  FROM products
  WHERE is_active = true
  GROUP BY 1;
$$;

-- 6. Price range (min, max, avg) by category.
CREATE OR REPLACE FUNCTION get_price_range_by_category()
RETURNS TABLE(category text, min_price numeric, max_price numeric, avg_price numeric)
LANGUAGE sql STABLE
AS $$
  SELECT
    c.name as category,
    MIN(p.price) as min_price,
    MAX(p.price) as max_price,
    ROUND(AVG(p.price)) as avg_price
  FROM products p
  JOIN categories c ON p.category_id = c.id
  GROUP BY c.name;
$$;

-- 7. Distinct product IDs that received views in a time range.
CREATE OR REPLACE FUNCTION get_product_ids_with_views(p_since timestamptz)
RETURNS TABLE(entity_id uuid)
LANGUAGE sql STABLE
AS $$
  SELECT DISTINCT ae.entity_id
  FROM analytics_events ae
  WHERE ae.event_type = 'product_view'
    AND ae.created_at >= p_since
    AND ae.entity_id IS NOT NULL;
$$;

-- 8. Distinct category IDs that have at least one active product.
CREATE OR REPLACE FUNCTION get_active_category_ids()
RETURNS TABLE(category_id uuid)
LANGUAGE sql STABLE
AS $$
  SELECT DISTINCT p.category_id
  FROM products p
  WHERE p.is_active = true;
$$;
