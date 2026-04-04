-- RPC functions for analytics aggregation.
-- Moves COUNT/GROUP BY work from JS to Postgres for efficiency.

-- 1. Count events grouped by type and metadata source within a time window.
--    Used by: getAnalyticsSummaryAndFunnel, getAnalyticsPeriodComparison
CREATE OR REPLACE FUNCTION get_event_type_counts(
  p_since timestamptz,
  p_until timestamptz DEFAULT NULL
)
RETURNS TABLE(event_type text, source text, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    ae.event_type,
    COALESCE(ae.metadata->>'source', '') as source,
    COUNT(*) as count
  FROM analytics_events ae
  WHERE ae.created_at >= p_since
    AND (p_until IS NULL OR ae.created_at < p_until)
  GROUP BY ae.event_type, ae.metadata->>'source';
$$;

-- 2. Top entities by event count for a given event type.
--    Used by: getTopProducts, getTopCategories
CREATE OR REPLACE FUNCTION get_top_entities(
  p_event_type text,
  p_since timestamptz,
  p_limit int DEFAULT 10
)
RETURNS TABLE(entity_slug text, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    ae.entity_slug,
    COUNT(*) as count
  FROM analytics_events ae
  WHERE ae.event_type = p_event_type
    AND ae.created_at >= p_since
    AND ae.entity_slug IS NOT NULL
  GROUP BY ae.entity_slug
  ORDER BY count DESC
  LIMIT p_limit;
$$;

-- 3. Daily event counts grouped by date and event type.
--    Used by: getDailyEventCounts
CREATE OR REPLACE FUNCTION get_daily_event_counts(
  p_since timestamptz
)
RETURNS TABLE(date date, event_type text, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    ae.created_at::date as date,
    ae.event_type,
    COUNT(*) as count
  FROM analytics_events ae
  WHERE ae.created_at >= p_since
  GROUP BY ae.created_at::date, ae.event_type
  ORDER BY date;
$$;

-- 4. WhatsApp clicks grouped by metadata source.
--    Used by: getWhatsAppBySource
CREATE OR REPLACE FUNCTION get_whatsapp_source_counts(
  p_since timestamptz
)
RETURNS TABLE(source text, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    COALESCE(ae.metadata->>'source', 'unknown') as source,
    COUNT(*) as count
  FROM analytics_events ae
  WHERE ae.event_type = 'whatsapp_click'
    AND ae.created_at >= p_since
  GROUP BY ae.metadata->>'source';
$$;

-- 5. Per-product conversion metrics: views + WhatsApp clicks from product detail.
--    Used by: getProductWhatsAppConversions
CREATE OR REPLACE FUNCTION get_product_conversion_metrics(
  p_since timestamptz
)
RETURNS TABLE(entity_slug text, views bigint, whatsapp_clicks bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    ae.entity_slug,
    COUNT(*) FILTER (WHERE ae.event_type = 'product_view') as views,
    COUNT(*) FILTER (WHERE ae.event_type = 'whatsapp_click' AND ae.metadata->>'source' = 'product_detail') as whatsapp_clicks
  FROM analytics_events ae
  WHERE ae.created_at >= p_since
    AND ae.entity_slug IS NOT NULL
    AND (
      ae.event_type = 'product_view'
      OR (ae.event_type = 'whatsapp_click' AND ae.metadata->>'source' = 'product_detail')
    )
  GROUP BY ae.entity_slug
  HAVING COUNT(*) FILTER (WHERE ae.event_type = 'product_view') > 0;
$$;
