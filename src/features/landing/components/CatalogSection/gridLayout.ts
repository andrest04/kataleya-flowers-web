interface GridLayout {
  grid: string;
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
  return LAYOUTS[count] ?? LAYOUTS[6];
}
