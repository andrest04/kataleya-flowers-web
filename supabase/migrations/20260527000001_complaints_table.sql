-- =============================================================================
-- Libro de Reclamaciones (INDECOPI)
-- Tabla pública de reclamos/quejas del consumidor.
-- =============================================================================
--
-- Flujo de seguridad:
--   - El formulario es PÚBLICO (anon). El consumidor inserta vía la RPC
--     `create_complaint` (SECURITY DEFINER) para poder recibir de vuelta el
--     número correlativo de su hoja, ya que anon NO puede hacer SELECT.
--   - Solo los admins (public.is_admin) pueden leer y actualizar (gestionar la
--     respuesta del proveedor).

-- ---------------------------------------------------------------------------
-- Table: complaints
-- ---------------------------------------------------------------------------
CREATE TABLE public.complaints (
  id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  correlativo         bigint        GENERATED ALWAYS AS IDENTITY,  -- N° de hoja

  -- Datos del consumidor reclamante
  consumer_name       text          NOT NULL,
  consumer_doc_type   text          NOT NULL CHECK (consumer_doc_type IN ('DNI', 'CE', 'PASAPORTE')),
  consumer_doc_number text          NOT NULL,
  consumer_address    text          NOT NULL,
  consumer_phone      text,
  consumer_email      text          NOT NULL,
  is_minor            boolean       NOT NULL DEFAULT false,
  guardian_name       text,                                       -- requerido a nivel app si is_minor

  -- Identificación del bien contratado
  item_type           text          NOT NULL CHECK (item_type IN ('PRODUCTO', 'SERVICIO')),
  item_description    text          NOT NULL,
  claimed_amount      numeric(10, 2) CHECK (claimed_amount IS NULL OR claimed_amount >= 0),

  -- Detalle de la reclamación
  complaint_type      text          NOT NULL CHECK (complaint_type IN ('RECLAMO', 'QUEJA')),
  detail              text          NOT NULL,
  consumer_request    text          NOT NULL,

  -- Gestión interna / respuesta del proveedor
  status              text          NOT NULL DEFAULT 'PENDIENTE'
                                    CHECK (status IN ('PENDIENTE', 'EN_PROCESO', 'RESPONDIDO')),
  provider_response   text,
  responded_at        timestamptz,
  email_sent          boolean       NOT NULL DEFAULT false,

  created_at          timestamptz   NOT NULL DEFAULT now(),
  updated_at          timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_complaints_created_at ON public.complaints (created_at DESC);
CREATE INDEX idx_complaints_status     ON public.complaints (status);

CREATE TRIGGER trg_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Insert público (formulario sin sesión). El consumidor nunca puede leer.
CREATE POLICY "anon_insert_complaints"
  ON public.complaints FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "auth_insert_complaints"
  ON public.complaints FOR INSERT TO authenticated
  WITH CHECK (true);

-- Solo admins leen y gestionan.
CREATE POLICY "admin_select_complaints"
  ON public.complaints FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "admin_update_complaints"
  ON public.complaints FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- RPC: create_complaint (SECURITY DEFINER)
-- Inserta el reclamo y devuelve el número correlativo + fecha + id para que el
-- consumidor (anon, sin SELECT) reciba el comprobante de su hoja.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_complaint(
  p_consumer_name       text,
  p_consumer_doc_type   text,
  p_consumer_doc_number text,
  p_consumer_address    text,
  p_consumer_email      text,
  p_item_type           text,
  p_item_description    text,
  p_complaint_type      text,
  p_detail              text,
  p_consumer_request    text,
  p_consumer_phone      text DEFAULT NULL,
  p_is_minor            boolean DEFAULT false,
  p_guardian_name       text DEFAULT NULL,
  p_claimed_amount      numeric DEFAULT NULL
)
RETURNS TABLE (id uuid, correlativo bigint, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.complaints (
    consumer_name, consumer_doc_type, consumer_doc_number, consumer_address,
    consumer_email, consumer_phone, is_minor, guardian_name,
    item_type, item_description, claimed_amount,
    complaint_type, detail, consumer_request
  )
  VALUES (
    p_consumer_name, p_consumer_doc_type, p_consumer_doc_number, p_consumer_address,
    p_consumer_email, p_consumer_phone, p_is_minor, p_guardian_name,
    p_item_type, p_item_description, p_claimed_amount,
    p_complaint_type, p_detail, p_consumer_request
  )
  RETURNING
    public.complaints.id,
    public.complaints.correlativo,
    public.complaints.created_at;
END;
$$;

REVOKE ALL ON FUNCTION public.create_complaint(
  text, text, text, text, text, text, text, text, text, text, text, boolean, text, numeric
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_complaint(
  text, text, text, text, text, text, text, text, text, text, text, boolean, text, numeric
) TO anon, authenticated;
