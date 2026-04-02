-- =============================================================================
-- Kataleya Flawers — Initial Schema
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "unaccent";  -- full-text search sin tildes

-- ---------------------------------------------------------------------------
-- ENUM Types
-- ---------------------------------------------------------------------------
CREATE TYPE product_color AS ENUM (
  'rojo',
  'rosa',
  'amarillo',
  'blanco',
  'morado',
  'naranja',
  'verde',
  'mixto'
);

CREATE TYPE product_flower_type AS ENUM (
  'rosas',
  'girasoles',
  'orquideas',   -- sin tilde para evitar encoding issues entre JS y SQL
  'astromelias',
  'lirios',
  'gerberas',
  'mixto'
);

-- ---------------------------------------------------------------------------
-- Trigger function: auto-update updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Table: categories
-- ---------------------------------------------------------------------------
CREATE TABLE categories (
  id             uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text          NOT NULL,
  slug           text          NOT NULL UNIQUE,
  description    text          NOT NULL,
  occasion       text,                          -- tagline: "Amistad, gratitud y alegría"
  image_url      text,                          -- URL en Supabase Storage
  display_order  integer       NOT NULL DEFAULT 0,
  is_active      boolean       NOT NULL DEFAULT true,
  created_at     timestamptz   NOT NULL DEFAULT now(),
  updated_at     timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_display_order ON categories (display_order);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: products
-- ---------------------------------------------------------------------------
CREATE TABLE products (
  id              uuid                   PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     uuid                   NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name            text                   NOT NULL,
  slug            text                   NOT NULL UNIQUE,
  description     text                   NOT NULL,

  -- Precio base o mínimo cuando price_variants existe.
  -- Invariante: price = MIN(price_variants[*].price) cuando price_variants IS NOT NULL.
  -- Esto permite filtrar por rango de precio sin tocar JSONB.
  price           numeric(10, 2)         NOT NULL CHECK (price >= 0),

  image_url       text                   NOT NULL,        -- imagen principal
  occasion        text,                                   -- hook: "Perfecto para San Valentín"
  note            text,                                   -- ej: "Incluye peluche Hello Kitty"

  -- Campos multi-valor: arrays de ENUMs con GIN index para filtros rápidos
  colors          product_color[]        NOT NULL DEFAULT '{}',
  flower_types    product_flower_type[]  NOT NULL DEFAULT '{}',

  -- Galería de imágenes adicionales (URLs en Supabase Storage)
  images          text[]                 NOT NULL DEFAULT '{}',

  -- Qué incluye el arreglo: ["24 rosas rojas", "Caja negra premium", ...]
  -- Solo se renderiza, nunca se filtra — JSONB es suficiente.
  includes        jsonb                  NOT NULL DEFAULT '[]',

  -- Tabla de precios variables: [{"label": "12 rosas", "price": 60}, ...]
  -- NULL = precio fijo. NOT NULL = usar tabla en el detalle del producto.
  price_variants  jsonb,

  display_order   integer                NOT NULL DEFAULT 0,
  is_active       boolean                NOT NULL DEFAULT true,
  is_featured     boolean                NOT NULL DEFAULT false,

  -- Columna generada para full-text search en español.
  -- includes::text castea el JSONB a string — los delimitadores JSON ([, ", ,) son
  -- ignorados por el parser de tsvector, las palabras reales sí se indexan.
  search_vector   tsvector GENERATED ALWAYS AS (
    to_tsvector(
      'spanish',
      coalesce(name, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(occasion, '') || ' ' ||
      coalesce(note, '') || ' ' ||
      coalesce(includes::text, '')
    )
  ) STORED,

  created_at      timestamptz            NOT NULL DEFAULT now(),
  updated_at      timestamptz            NOT NULL DEFAULT now()
);

-- Índices de productos
CREATE INDEX idx_products_category_order  ON products (category_id, display_order);
CREATE INDEX idx_products_is_active       ON products (is_active);
CREATE INDEX idx_products_featured        ON products (is_active, is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_colors          ON products USING GIN (colors);
CREATE INDEX idx_products_flower_types    ON products USING GIN (flower_types);
CREATE INDEX idx_products_search          ON products USING GIN (search_vector);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- View: category_price_summary
-- Calcula price_from dinámicamente desde los productos activos.
-- Se usa en la landing page y en el grid de categorías.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW category_price_summary AS
SELECT
  c.id AS category_id,
  MIN(
    CASE
      WHEN p.price_variants IS NOT NULL
        THEN (
          SELECT MIN((v ->> 'price')::numeric)
          FROM jsonb_array_elements(p.price_variants) AS v
        )
      ELSE p.price
    END
  ) AS price_from
FROM categories c
LEFT JOIN products p
  ON p.category_id = c.id
  AND p.is_active = true
GROUP BY c.id;

-- ---------------------------------------------------------------------------
-- RLS — Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;

-- categories: anónimos solo ven activas
CREATE POLICY "anon_read_active_categories"
  ON categories FOR SELECT TO anon
  USING (is_active = true);

-- categories: autenticados ven todas (incluyendo desactivadas, para el admin)
CREATE POLICY "auth_read_all_categories"
  ON categories FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admin_insert_categories"
  ON categories FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "admin_update_categories"
  ON categories FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "admin_delete_categories"
  ON categories FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- products: anónimos solo ven activos
CREATE POLICY "anon_read_active_products"
  ON products FOR SELECT TO anon
  USING (is_active = true);

-- products: autenticados ven todos (admin panel muestra desactivados)
CREATE POLICY "auth_read_all_products"
  ON products FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admin_insert_products"
  ON products FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "admin_update_products"
  ON products FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "admin_delete_products"
  ON products FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);
