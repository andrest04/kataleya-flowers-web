'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/primitives/chart';
import type { ChartConfig } from '@/components/ui/primitives/chart';
import type { TopProduct } from '@/features/admin/queries/analytics';

interface Props {
  data: TopProduct[];
}

const chartConfig: ChartConfig = {
  views: { label: 'Vistas', color: 'var(--chart-1)' },
} satisfies ChartConfig;

export default function TopProductsChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-center py-12" style={{ color: 'var(--color-muted)' }}>
        Sin datos de vistas todavía
      </p>
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
        <Bar dataKey="views" fill="var(--color-views)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
