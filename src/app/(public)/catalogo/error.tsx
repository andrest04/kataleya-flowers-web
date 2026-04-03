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
    <main className="min-h-screen bg-cream pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24">
        <EmptyState
          message="No pudimos cargar el catálogo. Por favor, intentá de nuevo."
          action={
            <Button variant="primary" onClick={reset}>
              Reintentar
            </Button>
          }
        />
        {process.env.NODE_ENV === 'development' && (
          <p className="mt-4 text-sm text-(--color-muted)">{error.message}</p>
        )}
      </div>
    </main>
  );
}
