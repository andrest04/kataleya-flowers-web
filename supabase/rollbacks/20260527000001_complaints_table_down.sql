-- =============================================================================
-- Rollback: Libro de Reclamaciones
-- =============================================================================

DROP FUNCTION IF EXISTS public.create_complaint(
  text, text, text, text, text, text, text, text, text, text, text, boolean, text, numeric
);

DROP TABLE IF EXISTS public.complaints CASCADE;
