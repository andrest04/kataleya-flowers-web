/**
 * Desktop bento placement for the landing category grid.
 * Class strings are full literals so Tailwind can statically extract them.
 * Mobile (<sm) is a snap carousel and tablet (sm-lg) a uniform 2-col grid,
 * so spans here only apply at lg+ (plus sm full-width fixes for odd counts).
 */
export type TileVariant = 'hero' | 'standard' | 'wide';

interface GridLayout {
  /** Grid container classes at lg+. */
  grid: string;
  /** Per-tile span classes, indexed by tile position. */
  tiles: string[];
}

const SIX_TILE_LAYOUT: GridLayout = {
  grid: 'lg:grid-cols-4 lg:grid-rows-[300px_300px_200px]',
  tiles: [
    'lg:col-span-2 lg:row-span-2',
    '',
    '',
    '',
    '',
    'lg:col-span-4',
  ],
};

const LAYOUTS: Record<number, GridLayout> = {
  6: SIX_TILE_LAYOUT,
  5: {
    grid: 'lg:grid-cols-4 lg:grid-rows-[300px_300px]',
    tiles: [
      'lg:col-span-2 lg:row-span-2',
      '',
      '',
      '',
      'sm:col-span-2 lg:col-span-1',
    ],
  },
  4: {
    grid: 'lg:grid-cols-4 lg:grid-rows-[300px_300px]',
    tiles: ['lg:col-span-2 lg:row-span-2', '', '', 'lg:col-span-2'],
  },
  3: {
    grid: 'lg:grid-cols-3 lg:grid-rows-[340px]',
    tiles: ['', '', 'sm:col-span-2 lg:col-span-1'],
  },
  2: {
    grid: 'lg:grid-cols-2 lg:grid-rows-[340px]',
    tiles: ['', ''],
  },
  1: {
    grid: 'lg:grid-cols-1 lg:grid-rows-[340px]',
    tiles: ['sm:col-span-2 lg:col-span-1'],
  },
};

export function getLayout(count: number): GridLayout {
  // Callers cap tiles at 6 (see CatalogSection/index.tsx); the fallback only
  // guards against future misuse and is not a designed layout for 7+ items.
  return LAYOUTS[count] ?? SIX_TILE_LAYOUT;
}

export function getTileVariant(count: number, index: number): TileVariant {
  if (count >= 4 && index === 0) return 'hero';
  if (count === 6 && index === 5) return 'wide';
  if (count === 4 && index === 3) return 'wide';
  return 'standard';
}
