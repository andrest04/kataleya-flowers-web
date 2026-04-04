'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/primitives/chart';
import type { ChartConfig } from '@/components/ui/primitives/chart';
import type { TopCategory } from '@/features/admin/queries/analytics';

interface Props {
  data: TopCategory[];
}

const chartConfig: ChartConfig = {
  clicks: { label: 'Clics', color: 'var(--chart-2)' },
} satisfies ChartConfig;

export default function TopCategoriesChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center space-y-2" style={{ color: 'var(--color-muted)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
          Todavía no hay clics en categorías en este rango.
        </p>
        <p className="text-sm">
          Cuando se active la exploración del catálogo, acá vas a ver qué categorías abren más recorrido.
        </p>
      </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="w-full [&>div]:!aspect-auto min-h-[300px]"
    >
      <BarChart data={data} layout="vertical">
        <CartesianGrid horizontal={false} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="clicks" fill="var(--color-clicks)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
