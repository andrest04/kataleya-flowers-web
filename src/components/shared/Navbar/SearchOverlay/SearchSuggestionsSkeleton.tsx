import { PANEL_CONTAINER } from "./constants";

export default function SearchSuggestionsSkeleton() {
  return (
    <div className={`${PANEL_CONTAINER} animate-pulse pt-6 pb-15`}>
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-10">
        <div className="lg:w-64 lg:shrink-0">
          <div className="mb-6 h-4 w-32 rounded bg-(--color-surface)" />
          <div className="flex flex-wrap items-start gap-3 lg:flex-col">
            <div className="h-9 w-24 rounded-md bg-(--color-surface)" />
            <div className="h-9 w-28 rounded-md bg-(--color-surface)" />
            <div className="h-9 w-20 rounded-md bg-(--color-surface)" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-6 h-4 w-24 rounded bg-(--color-surface)" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index}>
                <div className="aspect-[4/5] rounded-md bg-(--color-surface)" />
                <div className="mx-auto mt-4 h-4 w-3/4 rounded bg-(--color-surface)" />
                <div className="mx-auto mt-2 h-3 w-1/3 rounded bg-(--color-surface)" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
