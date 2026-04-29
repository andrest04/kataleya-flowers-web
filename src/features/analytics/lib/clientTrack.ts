import type { AnalyticsEventType } from '@/features/analytics/actions/trackEvent';
import { trackEvent } from '@/features/analytics/actions/trackEvent';

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

  // Tracking server-side es fire-and-forget intencional: NO bloqueamos la UX
  // del usuario esperando confirmación. Si el server action falla, lo logueamos
  // en dev pero NO interrumpimos la navegación. `void` no aplica porque
  // queremos capturar errores en silencio sin perder visibilidad en dev.
  trackEvent(params).catch((err: unknown) => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[analytics] trackEvent failed:", err);
    }
  });
}
