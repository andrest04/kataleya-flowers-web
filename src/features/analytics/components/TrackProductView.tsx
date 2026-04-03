'use client';

import { useEffect, useRef } from 'react';
import { clientTrackEvent } from '@/features/analytics/lib/clientTrack';

interface TrackProductViewProps {
  productId: string;
  productSlug: string;
}

export default function TrackProductView({ productId, productSlug }: TrackProductViewProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    clientTrackEvent({
      eventType: 'product_view',
      entityType: 'product',
      entityId: productId,
      entitySlug: productSlug,
    });
  }, [productId, productSlug]);

  return null;
}
