'use client';

import { Button, EmptyState } from '@/components/ui';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <EmptyState
        message="No se pudo cargar la sección de administración. Por favor, inténtalo de nuevo."
        action={
          <Button variant="primary" onClick={reset}>
            Reintentar
          </Button>
        }
      />
    </div>
  );
}
