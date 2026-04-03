import { Skeleton } from '@/components/ui';

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-(--color-white) border border-(--color-border)">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4 sm:p-6 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="hidden sm:block h-3 w-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-cream pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Skeleton className="h-4 w-40 mb-6" />
        <Skeleton className="h-10 w-64 mx-auto mb-12" />

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
