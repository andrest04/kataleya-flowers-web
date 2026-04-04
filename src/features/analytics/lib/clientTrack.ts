import { trackEvent } from '@/features/analytics/actions/trackEvent';
import type { AnalyticsEventType } from '@/features/analytics/actions/trackEvent';

const THROTTLE_MS = 30_000; // 30 seconds

function storageKey(eventType: string, id: string): string {
  return `ka:${eventType}:${id}`;
}

function shouldTrack(eventType: AnalyticsEventType, identifier: string): boolean {
  if (typeof window === 'undefined') return false;

  const key = storageKey(eventType, identifier);

  try {
    if (eventType === 'product_view' || eventType === 'category_click') {
      // Dedup: 1 per entity per session
      if (sessionStorage.getItem(key)) return false;
      sessionStorage.setItem(key, '1');
      return true;
    }

    if (eventType === 'whatsapp_click') {
      // Throttle: 1 per source per 30s
      const last = sessionStorage.getItem(key);
      if (last && Date.now() - Number(last) < THROTTLE_MS) return false;
      sessionStorage.setItem(key, String(Date.now()));
      return true;
    }
  } catch {
    // sessionStorage unavailable (private browsing, full storage) — track anyway
    return true;
  }

  return true;
}

interface ClientTrackParams {
  eventType: AnalyticsEventType;
  entityType?: 'product' | 'category';
  entityId?: string;
  entitySlug?: string;
  metadata?: Record<string, string>;
}

export function clientTrackEvent(params: ClientTrackParams): void {
  if (process.env.NODE_ENV !== 'production') return;
  // Build identifier for dedup/throttle
  const identifier =
    params.eventType === 'whatsapp_click'
      ? params.metadata?.source ?? 'unknown'
      : params.entitySlug ?? params.entityId ?? 'unknown';

  if (!shouldTrack(params.eventType, identifier)) return;

  trackEvent(params);
}
