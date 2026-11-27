import { cn } from '@/lib/utils';

const PILL_BASE =
  'inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 font-body text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)';

const PILL_IDLE =
  'border-(--color-border) text-(--color-dark) hover:border-(--color-primary) hover:text-(--color-primary)';

const PILL_ACTIVE = 'border-(--color-primary) bg-(--color-primary) text-(--color-white)';

const PILL_OUTLINE =
  'border-(--color-primary) text-(--color-primary) hover:bg-(--color-primary) hover:text-(--color-white)';

export function catalogPillClass(state: 'idle' | 'active' | 'outline' = 'idle'): string {
  return cn(
    PILL_BASE,
    state === 'active' ? PILL_ACTIVE : state === 'outline' ? PILL_OUTLINE : PILL_IDLE,
  );
}
