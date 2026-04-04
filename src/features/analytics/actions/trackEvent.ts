'use server';

import { createClient } from '@/lib/supabase/server';

export type AnalyticsEventType = 'product_view' | 'category_click' | 'whatsapp_click';

interface TrackEventParams {
  eventType: AnalyticsEventType;
  entityType?: 'product' | 'category';
  entityId?: string;
  entitySlug?: string;
  metadata?: Record<string, string>;
}

export async function trackEvent(params: TrackEventParams): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from('analytics_events').insert({
      event_type: params.eventType,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
      entity_slug: params.entitySlug ?? null,
      metadata: params.metadata ?? null,
    });
  } catch {
    // Fire-and-forget: never break user experience for analytics
  }
}
