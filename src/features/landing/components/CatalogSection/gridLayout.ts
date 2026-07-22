/**
 * Desktop column count for the landing category grid. Tiles are uniform size
 * (photo + caption below, no bento spans) — prominence comes from sort order
 * (featured-first), not from tile size. Mobile (<sm) is a snap carousel and
 * tablet (sm-lg) a uniform 2-col grid; `tiles` only fixes sm-breakpoint
 * orphans for odd counts so the last tile doesn't sit alone in its row.
 */
interface GridLayout {
  /** Grid container classes at lg+. */
  grid: string;
  /** Per-tile sm-breakpoint orphan fix, indexed by tile position. */
  tiles: string[];
}

const LAYOUTS: Record<number, GridLayout> = {
  6: { grid: 'lg:grid-cols-3', tiles: ['', '', '', '', '', ''] },
  5: {
    grid: 'lg:grid-cols-5',
    tiles: ['', '', '', '', 'sm:col-span-2 lg:col-span-1'],
  },
  4: { grid: 'lg:grid-cols-4', tiles: ['', '', '', ''] },
  3: {
    grid: 'lg:grid-cols-3',
    tiles: ['', '', 'sm:col-span-2 lg:col-span-1'],
  },
  2: { grid: 'lg:grid-cols-2', tiles: ['', ''] },
  1: { grid: 'lg:grid-cols-1', tiles: ['sm:col-span-2 lg:col-span-1'] },
};

export function getLayout(count: number): GridLayout {
  // Callers cap tiles at 6 (see CatalogSection/index.tsx); the fallback only
  // guards against future misuse and is not a designed layout for 7+ items.
  return LAYOUTS[count] ?? LAYOUTS[6];
}
