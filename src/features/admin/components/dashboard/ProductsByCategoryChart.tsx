'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/primitives/chart';
import type { ChartConfig } from '@/components/ui/primitives/chart';

interface Props {
  data: { category: string; count: number; active: number }[];
}

const chartConfig: ChartConfig = {
  count: { label: 'Total', color: 'var(--chart-1)' },
  active: { label: 'Activos', color: 'var(--chart-3)' },
} satisfies ChartConfig;

export default function ProductsByCategoryChart({ data }: Props) {
  return (
    <ChartContainer
      config={chartConfig}
      className="w-full [&>div]:!aspect-auto min-h-[300px]"
    >
      <BarChart data={data} layout="vertical">
        <CartesianGrid horizontal={false} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="category" width={120} tick={{ fontSize: 12 }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
        <Bar dataKey="active" fill="var(--color-active)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
