'use client';

import { useMemo, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ANALYTICS_RANGE_OPTIONS,
  type AnalyticsRange,
} from './analyticsRange';

interface Props {
  currentRange: AnalyticsRange;
  queryString?: string;
}

export default function AnalyticsRangeSelector({ currentRange, queryString }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const baseParams = useMemo(
    () => new URLSearchParams(queryString),
    [queryString],
  );

  const handleRangeChange = (range: AnalyticsRange) => {
    if (range === currentRange) return;

    const nextParams = new URLSearchParams(baseParams);
    nextParams.set('range', String(range));

    const nextQuery = nextParams.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
        Rango temporal
      </span>
      <div className="flex flex-wrap gap-2">
        {ANALYTICS_RANGE_OPTIONS.map((range) => {
          const isActive = range === currentRange;

          return (
            <button
              key={range}
              type="button"
              onClick={() => handleRangeChange(range)}
              disabled={isPending && !isActive}
              aria-pressed={isActive}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-70 disabled:cursor-wait"
              style={
                isActive
                  ? {
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-white)',
                    }
                  : {
                      background: 'var(--color-white)',
                      color: 'var(--color-dark)',
                      border: '1px solid var(--color-border)',
                    }
              }
            >
              {range} días
            </button>
          );
        })}
      </div>
    </div>
  );
}
