-- Table: analytics_events
-- Stores anonymous page/click events for dashboard reporting.
-- No PII is stored — only entity references and timestamps.

CREATE TABLE analytics_events (
  id          bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type  text         NOT NULL,
  entity_type text,
  entity_id   uuid,
  entity_slug text,
  metadata    jsonb,
  created_at  timestamptz  NOT NULL DEFAULT now()
);

-- Indexes for dashboard queries
CREATE INDEX idx_analytics_event_type ON analytics_events (event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events (created_at);
CREATE INDEX idx_analytics_entity     ON analytics_events (event_type, entity_id);

-- RLS: anon can INSERT (for tracking), authenticated can SELECT (for dashboard)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_events"
  ON analytics_events FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "auth_read_events"
  ON analytics_events FOR SELECT TO authenticated
  USING (true);
