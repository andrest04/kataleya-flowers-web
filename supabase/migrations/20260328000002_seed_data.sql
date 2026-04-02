-- =============================================================================
-- Kataleya Flawers — Seed Data (migrado desde src/data/products.ts)
-- =============================================================================
-- Estrategia: columna temporal legacy_id para trazar los IDs string del código
-- estático. Se elimina al final del script. Los UUIDs reales los genera Postgres.
-- =============================================================================

ALTER TABLE categories ADD COLUMN IF NOT EXISTS legacy_id text UNIQUE;
ALTER TABLE products    ADD COLUMN IF NOT EXISTS legacy_id text UNIQUE;

-- ---------------------------------------------------------------------------
-- Categories (6)
-- El orden en el array original de categories[] determina display_order.
-- ---------------------------------------------------------------------------
INSERT INTO categories (legacy_id, name, slug, description, occasion, image_url, display_order, is_active)
VALUES
  (
    'cat-004',
    'Flores Amarillas',
    'flores-amarillas',
    'Girasoles, rosas amarillas y astromelias envueltos en papel pergamino coreano impermeable. Desde ramos pequeños hasta buchones grandes.',
    'Amistad, gratitud y alegría',
    'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299537/ramo-5-girasoles-siempreviva-papel-rosado_y3joov.jpg',
    1,
    true
  ),
  (
    'cat-001',
    'Amor y Romance',
    'amor-y-romance',
    'Elegantes arreglos florales para expresar amor y romanticismo en cada ocasión especial',
    'Aniversarios y San Valentín',
    null, -- placeholder, pendiente foto real
    2,
    true
  ),
  (
    'cat-002',
    'Cumpleaños',
    'cumpleanos',
    'Vibrantes y alegres arreglos florales para celebrar el día más especial del año',
    'Cumpleaños y celebraciones',
    null,
    3,
    true
  ),
  (
    'cat-003',
    'Orquídeas Premium',
    'orquideas-premium',
    'Exquisitas orquídeas de alta calidad, símbolo de elegancia y distinción',
    'Elegancia y distinción',
    null,
    4,
    true
  ),
  (
    'cat-005',
    'Corporativo y Eventos',
    'corporativo-y-eventos',
    'Arreglos florales profesionales para empresas, oficinas y eventos corporativos en Lima',
    'Empresas y eventos',
    null,
    5,
    true
  ),
  (
    'cat-006',
    'Condolencias',
    'condolencias',
    'Arreglos florales sobrios y elegantes para expresar respeto y consuelo en momentos difíciles',
    'Homenaje y respeto',
    null,
    6,
    true
  );

-- ---------------------------------------------------------------------------
-- Products
-- Todos los INSERT hacen un subquery por legacy_id para resolver category_id.
-- ---------------------------------------------------------------------------

-- ==================== Amor y Romance (cat-001) =============================

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'prod-001',
  c.id,
  'Ramo Buchón Rojo Pasión',
  'ramo-buchon-rojo-pasion',
  'Exquisito ramo de 24 rosas rojas importadas en caja negra premium, ideal para expresar amor y pasión en su máxima expresión',
  249.90,
  '/placeholder-product.jpg',
  'Perfecto para aniversarios y San Valentín',
  ARRAY['rojo']::product_color[],
  ARRAY['rosas']::product_flower_type[],
  '["24 rosas rojas importadas", "Caja negra premium", "Lazo satinado", "Tarjeta personalizada"]'::jsonb,
  1, true, false
FROM categories c WHERE c.legacy_id = 'cat-001';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'prod-002',
  c.id,
  'Ramo Buchón Rosa Dulzura',
  'ramo-buchon-rosa-dulzura',
  'Delicado ramo de 24 rosas rosadas en caja blanca premium, perfecto para celebraciones románticas y momentos especiales',
  229.90,
  '/placeholder-product.jpg',
  'Ideal para cumpleaños románticos y celebraciones',
  ARRAY['rosa']::product_color[],
  ARRAY['rosas']::product_flower_type[],
  '["24 rosas rosadas", "Caja blanca premium", "Lazo satinado", "Tarjeta personalizada"]'::jsonb,
  2, true, false
FROM categories c WHERE c.legacy_id = 'cat-001';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'prod-003',
  c.id,
  'Corazón de Rosas',
  'corazon-de-rosas',
  'Arreglo en forma de corazón con 50 rosas rojas, el regalo más romántico para una ocasión muy especial',
  299.90,
  '/placeholder-product.jpg',
  'El regalo definitivo para San Valentín y aniversarios especiales',
  ARRAY['rojo']::product_color[],
  ARRAY['rosas']::product_flower_type[],
  '["50 rosas rojas", "Base decorativa", "Papel kraft premium", "Tarjeta personalizada"]'::jsonb,
  3, true, false
FROM categories c WHERE c.legacy_id = 'cat-001';

-- ==================== Cumpleaños (cat-002) =================================

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'prod-004',
  c.id,
  'Explosión Floral Fiesta',
  'explosion-floral-fiesta',
  'Vibrante arreglo multicolor de rosas, gerberas y flores tropicales que transmite alegría y celebración',
  179.90,
  '/placeholder-product.jpg',
  'Perfecto para cumpleaños y celebraciones especiales',
  ARRAY['mixto']::product_color[],
  ARRAY['rosas', 'gerberas', 'mixto']::product_flower_type[],
  '["Rosas multicolor", "Gerberas", "Flores tropicales", "Follaje premium", "Base elegante"]'::jsonb,
  1, true, false
FROM categories c WHERE c.legacy_id = 'cat-002';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'prod-005',
  c.id,
  'Ramo Cumpleaños Especial',
  'ramo-cumpleanos-especial',
  'Alegre ramo con una combinación de flores frescas en colores vibrantes, ideal para sorprender en el día especial',
  149.90,
  '/placeholder-product.jpg',
  'Ideal para sorprender a esa persona especial en su cumpleaños',
  ARRAY['mixto']::product_color[],
  ARRAY['mixto']::product_flower_type[],
  '["Flores de temporada variadas", "Follaje decorativo", "Papel y lazo coordinado", "Tarjeta"]'::jsonb,
  2, true, false
FROM categories c WHERE c.legacy_id = 'cat-002';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'prod-006',
  c.id,
  'Cesta Floral Premium',
  'cesta-floral-premium',
  'Hermosa cesta artesanal con arreglo floral de temporada, una presentación única y elegante',
  219.90,
  '/placeholder-product.jpg',
  'Una presentación única y especial para celebrar el cumpleaños',
  ARRAY['mixto']::product_color[],
  ARRAY['mixto']::product_flower_type[],
  '["Flores de temporada", "Cesta artesanal", "Follaje y musgo decorativo", "Lazo premium"]'::jsonb,
  3, true, false
FROM categories c WHERE c.legacy_id = 'cat-002';

-- ==================== Orquídeas Premium (cat-003) ==========================
-- Nota: flower_type ENUM usa 'orquídeas' (con tilde) desde migration 20260329000001

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'prod-007',
  c.id,
  'Orquídea Phalaenopsis Blanca',
  'orquidea-phalaenopsis-blanca',
  'Elegante orquídea Phalaenopsis blanca de alta calidad, símbolo de elegancia y distinción, perfecta como regalo corporativo o de lujo',
  189.90,
  '/placeholder-product.jpg',
  'El regalo más elegante para directivos, graduaciones y eventos especiales',
  ARRAY['blanco']::product_color[],
  ARRAY['orquídeas']::product_flower_type[],
  '["Orquídea Phalaenopsis blanca", "Maceta cerámica premium", "Sustrato especializado", "Tarjeta de cuidados"]'::jsonb,
  1, true, false
FROM categories c WHERE c.legacy_id = 'cat-003';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'prod-008',
  c.id,
  'Orquídea Morada Distinción',
  'orquidea-morada-distincion',
  'Espectacular orquídea Phalaenopsis morada, con flores que duran semanas y transmiten sofisticación',
  209.90,
  '/placeholder-product.jpg',
  'Perfecta para impresionar en cualquier ocasión especial o evento corporativo',
  ARRAY['morado']::product_color[],
  ARRAY['orquídeas']::product_flower_type[],
  '["Orquídea Phalaenopsis morada", "Maceta cerámica", "Sustrato especializado", "Guía de cuidados"]'::jsonb,
  2, true, false
FROM categories c WHERE c.legacy_id = 'cat-003';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'prod-009',
  c.id,
  'Arreglo de Orquídeas Mixtas',
  'arreglo-orquideas-mixtas',
  'Exclusivo arreglo con tres variedades de orquídeas en colores complementarios, una pieza floral de colección',
  349.90,
  '/placeholder-product.jpg',
  'El regalo de lujo para las ocasiones más importantes de tu vida',
  ARRAY['mixto']::product_color[],
  ARRAY['orquídeas']::product_flower_type[],
  '["3 orquídeas de distintas variedades", "Base decorativa de lujo", "Sustrato y cuidados incluidos"]'::jsonb,
  3, true, false
FROM categories c WHERE c.legacy_id = 'cat-003';

-- ==================== Flores Amarillas (cat-004) ===========================

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-001',
  c.id,
  'Ramo de Girasoles',
  'ramo-girasoles-001',
  '6 girasoles hipoalergénicos (no botan polen) envueltos en papel pergamino coreano impermeable.',
  60,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299567/ramo-girasoles-6-papel-coreano_wdbzuw.jpg',
  'Perfecto para amistad, gratitud y alegría',
  ARRAY['amarillo']::product_color[],
  ARRAY['girasoles']::product_flower_type[],
  '["6 girasoles hipoalergénicos", "Papel pergamino coreano impermeable"]'::jsonb,
  1, true, true  -- featured: producto con foto real y precio accesible
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-002',
  c.id,
  'Rosas Amarillas',
  'rosas-amarillas-002',
  '12 rosas amarillas con gypsófila envueltas en papel pergamino coreano impermeable.',
  55,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774301162/WhatsApp_Image_2026-03-23_at_2.42.02_PM_6_zf9llb.jpg',
  'Ideal para cumpleaños, amistad y gratitud',
  ARRAY['amarillo']::product_color[],
  ARRAY['rosas']::product_flower_type[],
  '["12 rosas amarillas", "Gypsófila", "Papel pergamino coreano impermeable"]'::jsonb,
  2, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-003',
  c.id,
  'Girasoles Lentes de Sol',
  'girasoles-lentes-sol-003',
  '3 girasoles hipoalergénicos (no botan polen) envueltos en papel pergamino coreano impermeable.',
  30,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299536/ramo-3-girasoles-gypsofila-papel-blanco_tfkghf.jpg',
  'Un detalle especial para quien querés alegrar el día',
  ARRAY['amarillo']::product_color[],
  ARRAY['girasoles']::product_flower_type[],
  '["3 girasoles hipoalergénicos", "Papel pergamino coreano impermeable"]'::jsonb,
  3, true, true  -- featured: precio de entrada más accesible
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-004',
  c.id,
  'Ramos de Girasoles',
  'girasoles-siempreviva-004',
  'Ramo de girasoles de vivero hipoalergénico (No botan Polen) y astromelia, envueltos en papel pergamino coreano impermeable.',
  60,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299537/ramo-5-girasoles-siempreviva-papel-rosado_y3joov.jpg',
  'Para transmitir alegría y energía positiva',
  ARRAY['amarillo']::product_color[],
  ARRAY['girasoles', 'astromelias']::product_flower_type[],
  '["Girasoles de vivero hipoalergénicos", "Astromelia", "Papel pergamino coreano impermeable"]'::jsonb,
  4, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-005',
  c.id,
  'Ramo de Astromelias',
  'ramo-astromelias-005',
  'Ramo minibuchón de astromelias envuelto en papel pergamino coreano impermeable.',
  30,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299542/ramo-astromelias-amarillas_fgwg2e.jpg',
  'Un detalle delicado y colorido para cualquier ocasión',
  ARRAY['amarillo']::product_color[],
  ARRAY['astromelias']::product_flower_type[],
  '["Astromelias frescas", "Papel pergamino coreano impermeable"]'::jsonb,
  5, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-006',
  c.id,
  'Felicidad y Amor',
  'felicidad-y-amor-006',
  'Ramo de rosas rojas con girasoles envuelto en papel pergamino coreano impermeable. La combinación perfecta de amor y alegría.',
  60,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299543/ramo-felicidad-amor-rosas-rojas-girasoles_q0gzfk.jpg',
  'Ideal para aniversarios, cumpleaños y sorpresas románticas',
  ARRAY['rojo', 'amarillo']::product_color[],
  ARRAY['rosas', 'girasoles']::product_flower_type[],
  '["Rosas rojas", "Girasoles hipoalergénicos", "Papel pergamino coreano impermeable"]'::jsonb,
  6, true, true  -- featured: combinación rosas + girasoles es top seller
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-007',
  c.id,
  'Girasoles y Siempreviva',
  'girasoles-y-siempreviva-007',
  '5 girasoles hipoalergénicos (no botan polen) con siempreviva envueltos en papel pergamino coreano impermeable.',
  50,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299549/ramo-girasoles-con-siempreviva-morado_n2xbja.jpg',
  'Para alegrar cualquier espacio con color y naturaleza',
  ARRAY['amarillo', 'morado']::product_color[],
  ARRAY['girasoles']::product_flower_type[],
  '["5 girasoles hipoalergénicos", "Siempreviva morada", "Papel pergamino coreano impermeable"]'::jsonb,
  7, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-008',
  c.id,
  'Ramo de Girasoles',
  'buchon-girasoles-008',
  '9 girasoles hipoalergénicos (No botan Polen) envueltos en papel pergamino coreano impermeable.',
  80,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774300927/WhatsApp_Image_2026-03-23_at_2.42.11_PM_1_hcwhxj.jpg',
  'Perfecto para sorprender con un detalle grande o pequeño',
  ARRAY['amarillo']::product_color[],
  ARRAY['girasoles']::product_flower_type[],
  '["9 girasoles hipoalergénicos de vivero", "Papel pergamino coreano impermeable"]'::jsonb,
  8, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-009',
  c.id,
  'Ramo de Rosas Amarillas',
  'buchon-rosas-amarillas-009',
  'Ramo buchón de rosas envuelto en papel pergamino coreano impermeable.',
  110,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299528/buchon-rosas-amarillas-mariposas_ll6mtf.jpg',
  'Para impresionar en ocasiones especiales y celebraciones importantes',
  ARRAY['amarillo']::product_color[],
  ARRAY['rosas']::product_flower_type[],
  '["Rosas amarillas premium", "Papel pergamino coreano impermeable", "Decoración especial"]'::jsonb,
  9, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-010',
  c.id,
  'Caja Box de Girasoles',
  'caja-box-girasoles-010',
  'Caja box de girasoles de vivero hipoalergénico (no botan polen). Una presentación única y elegante.',
  99,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299531/caja-box-girasoles-negra_gyxojx.jpg',
  'Ideal para regalar en casa, oficina o cualquier ocasión especial',
  ARRAY['amarillo']::product_color[],
  ARRAY['girasoles']::product_flower_type[],
  '["Girasoles de vivero hipoalergénicos", "Caja box decorativa"]'::jsonb,
  10, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

-- fa-011: Ramo Hello Kitty — tiene priceTable y note
INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion, note,
   colors, flower_types, includes, price_variants, display_order, is_active, is_featured)
SELECT
  'fa-011',
  c.id,
  'Ramo Hello Kitty',
  'ramo-hello-kitty-011',
  'Ramo de rosas estilo Hello Kitty con peluche incluido. Elegí la cantidad de rosas que querés. ¡El regalo más tierno!',
  90,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299552/ramo-hello-kitty-con-rosas_ub8w2u.jpg',
  'El regalo perfecto para niñas, cumpleaños y sorpresas especiales',
  'Incluye peluche Hello Kitty',
  ARRAY['mixto']::product_color[],
  ARRAY['rosas']::product_flower_type[],
  '["Rosas frescas", "Peluche Hello Kitty incluido", "Papel pergamino coreano impermeable"]'::jsonb,
  '[{"label":"12 rosas","price":90},{"label":"18 rosas","price":120},{"label":"24 rosas","price":155},{"label":"30 rosas","price":190},{"label":"50 rosas","price":280},{"label":"100 rosas","price":550},{"label":"120 rosas","price":660}]'::jsonb,
  11, true, true  -- featured: producto popular y diferenciador
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-012',
  c.id,
  'Buchón Girasoles y Rosas Rojas',
  'buchon-girasoles-rosas-rojas-012',
  'Ramo buchón de girasoles y rosas rojas con gypsófila de la mejor calidad, envuelto en papel pergamino coreano impermeable.',
  120,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774300659/WhatsApp_Image_2026-03-23_at_2.42.00_PM_3_vhalmv.jpg',
  'Para combinar amor y alegría en un solo regalo especial',
  ARRAY['amarillo', 'rojo']::product_color[],
  ARRAY['girasoles', 'rosas']::product_flower_type[],
  '["Girasoles hipoalergénicos", "Rosas rojas", "Gypsófila", "Papel pergamino coreano impermeable"]'::jsonb,
  12, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-014',
  c.id,
  'Ramos de Girasoles',
  'rosas-y-girasoles-014',
  'Ramo de girasoles de vivero hipoalergénico (No botan Polen) y rosas, envueltos en papel pergamino coreano impermeable.',
  50,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299550/ramo-girasoles-rosas-rojas-pequeno_rziehm.jpg',
  'Un detalle especial para alegrar el día de alguien querido',
  ARRAY['amarillo', 'rojo']::product_color[],
  ARRAY['girasoles', 'rosas']::product_flower_type[],
  '["Rosas rojas", "Girasoles hipoalergénicos de vivero", "Papel pergamino coreano impermeable"]'::jsonb,
  13, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

-- fa-015: Ramos de Rosas — tiene priceTable e images
INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, images, occasion,
   colors, flower_types, includes, price_variants, display_order, is_active, is_featured)
SELECT
  'fa-015',
  c.id,
  'Ramos de Rosas',
  'ramos-rosas-015',
  'Ramo buchón de rosas envuelto en papel pergamino coreano impermeable. Elegí la cantidad que querés para el regalo perfecto.',
  60,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774300987/WhatsApp_Image_2026-03-23_at_2.42.18_PM_1_f8k5qj.jpg',
  ARRAY['https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299558/ramo-rosas-amarillas-olivo_pil85j.jpg']::text[],
  'El regalo perfecto en cualquier cantidad para cualquier ocasión especial',
  ARRAY['amarillo']::product_color[],
  ARRAY['rosas']::product_flower_type[],
  '["Rosas frescas", "Papel pergamino coreano impermeable"]'::jsonb,
  '[{"label":"12 rosas","price":60},{"label":"18 rosas","price":90},{"label":"24 rosas","price":125},{"label":"30 rosas","price":160},{"label":"50 rosas","price":250},{"label":"100 rosas","price":510},{"label":"120 rosas","price":610}]'::jsonb,
  14, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-016',
  c.id,
  'Caja Box con Astromelia Naranja',
  'caja-box-girasoles-astromelia-016',
  'Caja box de girasoles de vivero hipoalergénico (no botan polen) con astromelia naranja. Un arreglo vibrante y colorido.',
  110,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299533/caja-girasoles-astromelias-naranja_mallrl.jpg',
  'Para regalar en casa, oficina y ocasiones que merecen un toque especial',
  ARRAY['amarillo', 'naranja']::product_color[],
  ARRAY['girasoles', 'astromelias']::product_flower_type[],
  '["Girasoles de vivero hipoalergénicos", "Astromelia naranja", "Caja box decorativa"]'::jsonb,
  15, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-017',
  c.id,
  'Girasoles y Siempreviva Grande',
  'girasoles-siempreviva-grande-017',
  '9 girasoles hipoalergénicos (no botan polen) con siempreviva, envueltos en papel pergamino coreano impermeable.',
  100,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774300813/WhatsApp_Image_2026-03-23_at_2.42.08_PM_2_kgl3la.jpg',
  'Un ramo abundante para sorprender con toda la fuerza del color amarillo',
  ARRAY['amarillo']::product_color[],
  ARRAY['girasoles']::product_flower_type[],
  '["9 girasoles hipoalergénicos", "Siempreviva", "Papel pergamino coreano impermeable"]'::jsonb,
  16, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-020',
  c.id,
  'Ramo de Rosas',
  'ramo-girasoles-astromelia-020',
  'Ramos de rosas amarillas estilo coreano envuelto en papel pergamino coreano impermeable.',
  75,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299545/ramo-girasoles-con-astromelias_yspdju.jpg',
  'Perfecto para alegrar cualquier espacio y transmitir gratitud',
  ARRAY['amarillo']::product_color[],
  ARRAY['rosas']::product_flower_type[],
  '["Rosas amarillas estilo coreano", "Papel pergamino coreano impermeable"]'::jsonb,
  17, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-021',
  c.id,
  'Ramo de Rosas Aromático',
  'ramo-rosas-coreano-021',
  'Ramo de rosas amarillo envuelto en papel pergamino coreano impermeable.',
  70,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774300981/WhatsApp_Image_2026-03-23_at_2.42.15_PM_u16nwz.jpg',
  'Ideal para regalar con estilo en cumpleaños, aniversarios y celebraciones',
  ARRAY['amarillo']::product_color[],
  ARRAY['rosas']::product_flower_type[],
  '["Rosas amarillas frescas", "Follaje eucalipto", "Papel pergamino coreano impermeable"]'::jsonb,
  18, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-022',
  c.id,
  'Buchón de Astromelias',
  'buchon-astromelias-022',
  'Ramo de astromelias amarillas envuelto en papel pergamino coreano impermeable. Delicado, aromático y lleno de color.',
  90,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299525/buchon-astromelias-amarillas_fnyxsj.jpg',
  'Un regalo delicado y especial para cualquier momento del año',
  ARRAY['amarillo']::product_color[],
  ARRAY['astromelias']::product_flower_type[],
  '["Astromelias amarillas frescas", "Papel pergamino coreano impermeable"]'::jsonb,
  19, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

-- fa-023-024: Ramos de Girasoles Buchón — tiene priceTable e images
INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, images, occasion,
   colors, flower_types, includes, price_variants, display_order, is_active, is_featured)
SELECT
  'fa-023-024',
  c.id,
  'Ramos de Girasoles Buchón',
  'ramos-girasoles-buchon-023-024',
  'Ramo buchón de girasoles de vivero hipoalergénico (no botan polen). Elegí la cantidad que querés para el regalo perfecto.',
  45,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774301082/WhatsApp_Image_2026-03-23_at_2.42.12_PM_1_wvaime.jpg',
  ARRAY['https://res.cloudinary.com/dbjm18dqg/image/upload/v1774300576/WhatsApp_Image_2026-03-23_at_2.42.20_PM_dmfxfv.jpg']::text[],
  'El regalo perfecto en cualquier cantidad — desde un detalle hasta una gran sorpresa',
  ARRAY['amarillo']::product_color[],
  ARRAY['girasoles']::product_flower_type[],
  '["Girasoles de vivero hipoalergénicos", "Papel pergamino coreano impermeable"]'::jsonb,
  '[{"label":"5 girasoles","price":45},{"label":"6 girasoles","price":54},{"label":"7 girasoles","price":63},{"label":"9 girasoles","price":80},{"label":"10 girasoles","price":90},{"label":"20 girasoles","price":160},{"label":"40 girasoles","price":320},{"label":"100 girasoles","price":799}]'::jsonb,
  20, true, true  -- featured: variante más vendida del catálogo
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-031',
  c.id,
  'Girasoles con Siempreviva',
  'girasoles-con-siempreviva-031',
  '5 girasoles hipoalergénicos (no botan polen) con siempreviva, envueltos en papel pergamino coreano impermeable. Un ramo alegre y lleno de vida que combina la calidez del girasol con la textura delicada de la siempreviva.',
  50,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774300733/WhatsApp_Image_2026-03-23_at_2.42.13_PM_2_x9ulwl.jpg',
  'Para alegrar cualquier espacio con color, textura y mucha naturaleza',
  ARRAY['amarillo']::product_color[],
  ARRAY['girasoles']::product_flower_type[],
  '["5 girasoles hipoalergénicos", "Siempreviva", "Papel pergamino coreano impermeable"]'::jsonb,
  21, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

-- fa-025: tiene images
INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, images, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-025',
  c.id,
  'Ramo de Rosas con Astromelias',
  'ramo-rosas-astromelias-025',
  'Ramo de rosas amarillas con astromelias envuelto en papel pergamino coreano impermeable. Elegante combinación de colores cálidos.',
  60,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299554/ramo-rosas-amarillas-con-astromelias_sizvxr.jpg',
  ARRAY['https://res.cloudinary.com/dbjm18dqg/image/upload/v1774300940/WhatsApp_Image_2026-03-23_at_2.42.14_PM_3_whpna3.jpg']::text[],
  'Para sorprender con un arreglo elegante y lleno de color',
  ARRAY['amarillo']::product_color[],
  ARRAY['rosas', 'astromelias']::product_flower_type[],
  '["Rosas amarillas", "Astromelias", "Papel pergamino coreano impermeable"]'::jsonb,
  22, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-026',
  c.id,
  'Ramo de Rosas Aromáticas e Hipérico',
  'ramo-rosas-aromatico-026',
  'Un ramo que enamora por su aroma y su estética: rosas amarillas frescas acompañadas de hipérico, envueltas en papel pergamino coreano impermeable. Una combinación silvestre y delicada que convierte cualquier detalle en un regalo memorable.',
  45,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299561/ramo-rosas-aromatico-papel-kraft_vqgw4h.jpg',
  'Un regalo sensorial que combina belleza, aroma y un toque silvestre irresistible',
  ARRAY['amarillo']::product_color[],
  ARRAY['rosas']::product_flower_type[],
  '["Rosas amarillas aromáticas", "Hipérico", "Papel pergamino coreano impermeable"]'::jsonb,
  23, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-027',
  c.id,
  'Ramo de Girasoles Pequeño',
  'ramo-tres-girasoles-027',
  '3 girasoles hipoalergénicos (no botan polen) envueltos en papel pergamino coreano impermeable. El detalle perfecto.',
  40,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299534/ramo-3-girasoles-gypsofila-kraft_zugzr9.jpg',
  'Un pequeño detalle que transmite mucha alegría',
  ARRAY['amarillo']::product_color[],
  ARRAY['girasoles']::product_flower_type[],
  '["3 girasoles hipoalergénicos", "Papel pergamino coreano impermeable"]'::jsonb,
  24, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

-- fa-029-030: tiene priceTable e images
INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, images, occasion,
   colors, flower_types, includes, price_variants, display_order, is_active, is_featured)
SELECT
  'fa-029-030',
  c.id,
  'Ramos de Rosas Personalizados',
  'ramos-rosas-personalizados-029-030',
  'Ramo buchón de rosas envuelto en papel pergamino coreano impermeable. Elegí la cantidad perfecta para tu regalo.',
  50,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299565/ramo-rosas-mixtas-colores_xwqmhc.jpg',
  ARRAY['https://res.cloudinary.com/dbjm18dqg/image/upload/v1774301094/WhatsApp_Image_2026-03-23_at_2.42.17_PM_2_i621bd.jpg']::text[],
  'El regalo perfecto en cualquier cantidad para cualquier ocasión especial',
  ARRAY['mixto']::product_color[],
  ARRAY['rosas']::product_flower_type[],
  '["Rosas frescas de calidad", "Papel pergamino coreano impermeable"]'::jsonb,
  '[{"label":"12 rosas","price":50},{"label":"18 rosas","price":75},{"label":"24 rosas","price":100},{"label":"30 rosas","price":130},{"label":"50 rosas","price":220},{"label":"100 rosas","price":420}]'::jsonb,
  25, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'fa-032',
  c.id,
  'Gran Buchón de Rosas Amarillas',
  'gran-buchon-rosas-amarillas-032',
  'Imponente ramo buchón de rosas amarillas envuelto en papel pergamino coreano impermeable. Un regalo que impresiona desde el primer vistazo — abundante, luminoso y lleno de elegancia natural.',
  230,
  'https://res.cloudinary.com/dbjm18dqg/image/upload/v1774300634/WhatsApp_Image_2026-03-23_at_2.41.59_PM_1_fouxmu.jpg',
  'Para ocasiones que merecen un regalo a la altura — cumpleaños, aniversarios y celebraciones especiales',
  ARRAY['amarillo']::product_color[],
  ARRAY['rosas']::product_flower_type[],
  '["Rosas amarillas frescas", "Papel pergamino coreano impermeable"]'::jsonb,
  26, true, false
FROM categories c WHERE c.legacy_id = 'cat-004';

-- ==================== Corporativo y Eventos (cat-005) =====================

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'prod-013',
  c.id,
  'Centro de Mesa Empresarial',
  'centro-de-mesa-empresarial',
  'Elegante centro de mesa floral para reuniones y eventos corporativos, transmite profesionalismo y sofisticación',
  299.90,
  '/placeholder-product.jpg',
  'Ideal para reuniones corporativas, lanzamientos y eventos empresariales en Lima',
  ARRAY['blanco', 'verde']::product_color[],
  ARRAY['mixto']::product_flower_type[],
  '["Arreglo floral premium", "Flores blancas y verdes", "Base de cristal o cerámica", "Follaje seleccionado"]'::jsonb,
  1, true, false
FROM categories c WHERE c.legacy_id = 'cat-005';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'prod-014',
  c.id,
  'Arreglo Gerencial Premium',
  'arreglo-gerencial-premium',
  'Impresionante arreglo floral de alto impacto para regalar a directivos y ejecutivos, con flores de máxima calidad',
  399.90,
  '/placeholder-product.jpg',
  'El regalo perfecto para directivos, gerentes y ejecutivos de alto nivel',
  ARRAY['mixto']::product_color[],
  ARRAY['mixto']::product_flower_type[],
  '["Flores premium de importación", "Follaje de lujo", "Caja o base premium", "Tarjeta corporativa"]'::jsonb,
  2, true, false
FROM categories c WHERE c.legacy_id = 'cat-005';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'prod-015',
  c.id,
  'Decoración Floral para Evento',
  'decoracion-floral-evento',
  'Servicio de decoración floral completa para eventos empresariales, incluyendo diseño, instalación y remoción',
  599.90,
  '/placeholder-product.jpg',
  'Para conferencias, lanzamientos de productos, cenas corporativas y eventos en Lima',
  ARRAY['mixto']::product_color[],
  ARRAY['mixto']::product_flower_type[],
  '["Consulta de diseño incluida", "Flores frescas de temporada", "Instalación y montaje", "Retiro al finalizar"]'::jsonb,
  3, true, false
FROM categories c WHERE c.legacy_id = 'cat-005';

-- ==================== Condolencias (cat-006) ==============================

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'prod-016',
  c.id,
  'Corona Fúnebre Clásica',
  'corona-funebre-clasica',
  'Corona tradicional de flores blancas y verdes que transmite respeto, paz y consuelo en momentos difíciles',
  249.90,
  '/placeholder-product.jpg',
  'Para velorios, funerarias y homenajes, con entrega discreta y respetuosa',
  ARRAY['blanco']::product_color[],
  ARRAY['mixto']::product_flower_type[],
  '["Flores blancas y verdes", "Base circular premium", "Cinta con dedicatoria", "Entrega discreta"]'::jsonb,
  1, true, false
FROM categories c WHERE c.legacy_id = 'cat-006';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'prod-017',
  c.id,
  'Ramo de Condolencias Blanco',
  'ramo-condolencias-blanco',
  'Sobrio y elegante ramo de flores blancas que expresa serenidad y respeto, el gesto más apropiado para acompañar en el dolor',
  179.90,
  '/placeholder-product.jpg',
  'El gesto más apropiado para acompañar a una familia en momentos de pérdida',
  ARRAY['blanco']::product_color[],
  ARRAY['mixto']::product_flower_type[],
  '["Flores blancas de temporada", "Follaje verde", "Papel kraft natural", "Tarjeta de condolencias"]'::jsonb,
  2, true, false
FROM categories c WHERE c.legacy_id = 'cat-006';

INSERT INTO products
  (legacy_id, category_id, name, slug, description, price, image_url, occasion,
   colors, flower_types, includes, display_order, is_active, is_featured)
SELECT
  'prod-018',
  c.id,
  'Arreglo de Lirios Blancos',
  'arreglo-lirios-blancos',
  'Arreglo de lirios blancos, símbolo de pureza y renovación, una ofrenda floral de profundo significado',
  199.90,
  '/placeholder-product.jpg',
  'Una ofrenda floral de profundo significado para homenajes y conmemoraciones',
  ARRAY['blanco']::product_color[],
  ARRAY['lirios']::product_flower_type[],
  '["Lirios blancos importados", "Follaje verde oscuro", "Base cerámica blanca", "Tarjeta personalizada"]'::jsonb,
  3, true, false
FROM categories c WHERE c.legacy_id = 'cat-006';

-- ---------------------------------------------------------------------------
-- Cleanup: eliminar columnas temporales de trazabilidad
-- ---------------------------------------------------------------------------
ALTER TABLE categories DROP COLUMN legacy_id;
ALTER TABLE products    DROP COLUMN legacy_id;
