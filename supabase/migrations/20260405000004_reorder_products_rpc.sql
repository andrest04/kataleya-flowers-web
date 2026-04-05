-- RPC to reorder products by array of IDs (same pattern as reorder_categories)
CREATE OR REPLACE FUNCTION reorder_products(p_ordered_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  FOR i IN 1..array_length(p_ordered_ids, 1) LOOP
    UPDATE products
    SET display_order = i
    WHERE id = p_ordered_ids[i];
  END LOOP;
END;
$$;
