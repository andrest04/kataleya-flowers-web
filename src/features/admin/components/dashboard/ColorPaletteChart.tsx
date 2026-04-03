'use client';

import { PieChart, Pie } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/primitives/chart';
import type { ChartConfig } from '@/components/ui/primitives/chart';

interface Props {
  data: { color: string; count: number; fill: string }[];
}

const chartConfig: ChartConfig = {
  count: { label: 'Cantidad' },
  rojo: { label: 'Rojo', color: 'var(--color-flower-rojo)' },
  rosa: { label: 'Rosa', color: 'var(--color-flower-rosa)' },
  amarillo: { label: 'Amarillo', color: 'var(--color-flower-amarillo)' },
  blanco: { label: 'Blanco', color: 'var(--color-flower-blanco)' },
  morado: { label: 'Morado', color: 'var(--color-flower-morado)' },
  naranja: { label: 'Naranja', color: 'var(--color-flower-naranja)' },
  verde: { label: 'Verde', color: 'var(--color-flower-verde)' },
  mixto: { label: 'Mixto', color: 'var(--color-flower-mixto)' },
} satisfies ChartConfig;

export default function ColorPaletteChart({ data }: Props) {
  return (
    <ChartContainer config={chartConfig} className="w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="color" />} />
        <Pie
          data={data}
          dataKey="count"
          nameKey="color"
          innerRadius={60}
          outerRadius={90}
        />
      </PieChart>
    </ChartContainer>
  );
}
