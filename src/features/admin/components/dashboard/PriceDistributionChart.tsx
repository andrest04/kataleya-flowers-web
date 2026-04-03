'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/primitives/chart';
import type { ChartConfig } from '@/components/ui/primitives/chart';

interface Props {
  data: { range: string; count: number }[];
}

const chartConfig: ChartConfig = {
  count: { label: 'Productos', color: 'var(--chart-2)' },
} satisfies ChartConfig;

export default function PriceDistributionChart({ data }: Props) {
  return (
    <ChartContainer config={chartConfig} className="w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="range" tick={{ fontSize: 11 }} />
        <YAxis type="number" allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
