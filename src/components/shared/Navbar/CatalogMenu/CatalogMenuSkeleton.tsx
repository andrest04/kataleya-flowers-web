import { PANEL_CONTAINER } from "../SearchOverlay/constants";

export default function CatalogMenuSkeleton() {
  return (
    <div className={`${PANEL_CONTAINER} animate-pulse pt-8`}>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr]">
        <ul className="flex flex-col gap-5">
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index} className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 bg-(--color-surface)" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-2/3 rounded bg-(--color-surface)" />
                <div className="mt-2 h-3 w-1/2 rounded bg-(--color-surface)" />
              </div>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-6">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index}>
              <div className="aspect-square bg-(--color-surface)" />
              <div className="mt-4 h-4 w-3/4 rounded bg-(--color-surface)" />
              <div className="mt-2 h-3 w-full rounded bg-(--color-surface)" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
