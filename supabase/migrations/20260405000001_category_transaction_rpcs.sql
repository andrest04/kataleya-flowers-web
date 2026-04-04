-- Transactional RPC functions for category operations
-- Each function runs inside an implicit transaction — if any step fails, everything rolls back.

-- 1. Delete category + all its products (cascade mode)
-- Returns array of image URLs for Cloudinary cleanup in the app layer.
CREATE OR REPLACE FUNCTION delete_category_cascade(p_category_id uuid)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_image_urls text[] := '{}';
  v_cat_image text;
  r RECORD;
BEGIN
  -- Collect all product image URLs
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

  -- Delete all products in this category
  DELETE FROM products WHERE category_id = p_category_id;

  -- Collect category image URL
  SELECT image_url INTO v_cat_image
  FROM categories
  WHERE id = p_category_id;

  IF v_cat_image IS NOT NULL THEN
    v_image_urls := v_image_urls || v_cat_image;
  END IF;

  -- Delete the category
  DELETE FROM categories WHERE id = p_category_id;

  RETURN v_image_urls;
END;
$$;

-- 2. Reassign products to another category, then delete the original category
-- Returns the deleted category's image URL for Cloudinary cleanup (or NULL).
CREATE OR REPLACE FUNCTION delete_category_reassign(
  p_category_id uuid,
  p_reassign_to uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cat_image text;
  v_target_exists boolean;
BEGIN
  -- Validate target category exists and is different
  SELECT EXISTS(
    SELECT 1 FROM categories WHERE id = p_reassign_to AND id != p_category_id
  ) INTO v_target_exists;

  IF NOT v_target_exists THEN
    RAISE EXCEPTION 'Target category does not exist or is the same as source';
  END IF;

  -- Reassign all products
  UPDATE products
  SET category_id = p_reassign_to
  WHERE category_id = p_category_id;

  -- Collect category image URL
  SELECT image_url INTO v_cat_image
  FROM categories
  WHERE id = p_category_id;

  -- Delete the category
  DELETE FROM categories WHERE id = p_category_id;

  RETURN v_cat_image;
END;
$$;

-- 3. Atomic reorder of categories by ID array
-- Index position in the array determines display_order (1-based).
CREATE OR REPLACE FUNCTION reorder_categories(p_ordered_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  FOR i IN 1..array_length(p_ordered_ids, 1) LOOP
    UPDATE categories
    SET display_order = i
    WHERE id = p_ordered_ids[i];
  END LOOP;
END;
$$;
