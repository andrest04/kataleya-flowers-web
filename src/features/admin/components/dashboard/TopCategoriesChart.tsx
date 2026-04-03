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
      <p className="text-sm text-center py-12" style={{ color: 'var(--color-muted)' }}>
        Sin datos de clics todavía
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
        <Bar dataKey="clicks" fill="var(--color-clicks)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
