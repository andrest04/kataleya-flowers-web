import { Skeleton } from '@/components/ui/primitives/skeleton';

export default function Loading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-52 mt-2" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="flex gap-3">
          <Skeleton className="h-9 w-36 rounded-full" />
          <Skeleton className="h-9 w-40 rounded-full" />
          <Skeleton className="h-9 w-44 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
