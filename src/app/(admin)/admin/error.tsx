'use client';

import { Button, EmptyState } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <EmptyState
        message="No se pudo cargar el dashboard. Por favor, inténtalo de nuevo."
        action={
          <Button variant="primary" onClick={reset}>
            Reintentar
          </Button>
        }
      />
      {process.env.NODE_ENV === 'development' && (
        <p className="mt-4 text-sm" style={{ color: 'var(--color-muted)' }}>
          {error.message}
        </p>
      )}
    </div>
  );
}
