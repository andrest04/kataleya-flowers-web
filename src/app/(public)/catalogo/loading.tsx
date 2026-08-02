import { Skeleton } from '@/components/ui/primitives/skeleton';

function ProductSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="space-y-2 px-4 py-4">
        <Skeleton className="mx-auto h-5 w-2/3" />
        <Skeleton className="mx-auto h-4 w-20" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-cream px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-8xl">
        <div className="mx-auto mb-10 max-w-3xl space-y-4 text-center sm:mb-12">
          <Skeleton className="mx-auto h-12 w-4/5 max-w-xl" />
          <Skeleton className="mx-auto h-5 w-3/4 max-w-2xl" />
        </div>

        <div className="flex gap-3 overflow-hidden sm:grid sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="w-[42vw] max-w-44 shrink-0 space-y-2 sm:w-auto sm:max-w-none">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <Skeleton className="mx-auto h-4 w-2/3" />
            </div>
          ))}
        </div>

        <div className="my-8 flex items-center justify-between border-y border-(--color-border) py-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-44" />
        </div>

        <div className="grid grid-cols-1 gap-x-3 gap-y-10 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
