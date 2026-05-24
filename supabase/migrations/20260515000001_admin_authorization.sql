-- =============================================================================
-- Admin authorization hardening
-- =============================================================================

-- Canonical admin allowlist.
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_users_select_self" ON public.admin_users;
CREATE POLICY "admin_users_select_self"
  ON public.admin_users FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DO $$
DECLARE
  v_admin_user_id uuid;
BEGIN
  SELECT id
  INTO v_admin_user_id
  FROM auth.users
  WHERE email = 'aatg2004@gmail.com'
  LIMIT 1;

  IF v_admin_user_id IS NULL THEN
    RAISE NOTICE 'admin seed skipped: auth.users email aatg2004@gmail.com not found';
  ELSE
    INSERT INTO public.admin_users (user_id, email)
    VALUES (v_admin_user_id, 'aatg2004@gmail.com')
    ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = p_user_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.require_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden'
      USING ERRCODE = '42501',
            MESSAGE = 'admin access required';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.require_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.require_admin() TO authenticated;

-- categories
DROP POLICY IF EXISTS "anon_read_active_categories" ON public.categories;
DROP POLICY IF EXISTS "auth_read_all_categories" ON public.categories;
DROP POLICY IF EXISTS "admin_insert_categories" ON public.categories;
DROP POLICY IF EXISTS "admin_update_categories" ON public.categories;
DROP POLICY IF EXISTS "admin_delete_categories" ON public.categories;

CREATE POLICY "public_read_active_categories"
  ON public.categories FOR SELECT TO public
  USING (is_active = true);

CREATE POLICY "admin_read_all_categories"
  ON public.categories FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "admin_insert_categories"
  ON public.categories FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin_update_categories"
  ON public.categories FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin_delete_categories"
  ON public.categories FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- products
DROP POLICY IF EXISTS "anon_read_active_products" ON public.products;
DROP POLICY IF EXISTS "auth_read_all_products" ON public.products;
DROP POLICY IF EXISTS "admin_insert_products" ON public.products;
DROP POLICY IF EXISTS "admin_update_products" ON public.products;
DROP POLICY IF EXISTS "admin_delete_products" ON public.products;

CREATE POLICY "public_read_active_products"
  ON public.products FOR SELECT TO public
  USING (is_active = true);

CREATE POLICY "admin_read_all_products"
  ON public.products FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "admin_insert_products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin_update_products"
  ON public.products FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin_delete_products"
  ON public.products FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- flower_types
DROP POLICY IF EXISTS "anon_read_flower_types" ON public.flower_types;
DROP POLICY IF EXISTS "auth_read_flower_types" ON public.flower_types;
DROP POLICY IF EXISTS "auth_insert_flower_types" ON public.flower_types;
DROP POLICY IF EXISTS "auth_update_flower_types" ON public.flower_types;
DROP POLICY IF EXISTS "auth_delete_flower_types" ON public.flower_types;

CREATE POLICY "public_read_flower_types"
  ON public.flower_types FOR SELECT TO public
  USING (true);

CREATE POLICY "admin_insert_flower_types"
  ON public.flower_types FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin_update_flower_types"
  ON public.flower_types FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin_delete_flower_types"
  ON public.flower_types FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- product_colors
DROP POLICY IF EXISTS "anon_read_product_colors" ON public.product_colors;
DROP POLICY IF EXISTS "auth_read_product_colors" ON public.product_colors;
DROP POLICY IF EXISTS "auth_insert_product_colors" ON public.product_colors;
DROP POLICY IF EXISTS "auth_update_product_colors" ON public.product_colors;
DROP POLICY IF EXISTS "auth_delete_product_colors" ON public.product_colors;

CREATE POLICY "public_read_product_colors"
  ON public.product_colors FOR SELECT TO public
  USING (true);

CREATE POLICY "admin_insert_product_colors"
  ON public.product_colors FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin_update_product_colors"
  ON public.product_colors FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin_delete_product_colors"
  ON public.product_colors FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- analytics_events
DROP POLICY IF EXISTS "auth_read_events" ON public.analytics_events;

CREATE POLICY "admin_read_events"
  ON public.analytics_events FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- Harden SECURITY DEFINER RPCs that bypass RLS.
CREATE OR REPLACE FUNCTION public.delete_category_cascade(p_category_id uuid)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_image_urls text[] := '{}';
  v_cat_image text;
  r RECORD;
BEGIN
  PERFORM public.require_admin();

  FOR r IN
    SELECT image_url, images
    FROM products
    WHERE category_id = p_category_id
  LOOP
    IF r.image_url IS NOT NULL THEN
      v_image_urls := v_image_urls || r.image_url;
    END IF;
    IF r.images IS NOT NULL THEN
      v_image_urls := v_image_urls || ARRAY(SELECT unnest(r.images));
    END IF;
  END LOOP;

  DELETE FROM products WHERE category_id = p_category_id;

  SELECT image_url INTO v_cat_image
  FROM categories
  WHERE id = p_category_id;

  IF v_cat_image IS NOT NULL THEN
    v_image_urls := v_image_urls || v_cat_image;
  END IF;

  DELETE FROM categories WHERE id = p_category_id;

  RETURN v_image_urls;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_category_reassign(
  p_category_id uuid,
  p_reassign_to uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cat_image text;
  v_target_exists boolean;
BEGIN
  PERFORM public.require_admin();

  SELECT EXISTS(
    SELECT 1 FROM categories WHERE id = p_reassign_to AND id != p_category_id
  ) INTO v_target_exists;

  IF NOT v_target_exists THEN
    RAISE EXCEPTION 'Target category does not exist or is the same as source';
  END IF;

  UPDATE products
  SET category_id = p_reassign_to
  WHERE category_id = p_category_id;

  SELECT image_url INTO v_cat_image
  FROM categories
  WHERE id = p_category_id;

  DELETE FROM categories WHERE id = p_category_id;

  RETURN v_cat_image;
END;
$$;

CREATE OR REPLACE FUNCTION public.reorder_categories(p_ordered_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.require_admin();

  FOR i IN 1..array_length(p_ordered_ids, 1) LOOP
    UPDATE categories
    SET display_order = i
    WHERE id = p_ordered_ids[i];
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.reorder_products(p_ordered_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.require_admin();

  FOR i IN 1..array_length(p_ordered_ids, 1) LOOP
    UPDATE products
    SET display_order = i
    WHERE id = p_ordered_ids[i];
  END LOOP;
END;
$$;
