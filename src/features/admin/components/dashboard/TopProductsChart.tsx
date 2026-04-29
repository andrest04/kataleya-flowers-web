'use client';

import { Bar, BarChart, CartesianGrid,XAxis, YAxis } from 'recharts';

import type { ChartConfig } from '@/components/ui/primitives/chart';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/primitives/chart';
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
      <div className="py-12 text-center space-y-2" style={{ color: 'var(--color-muted)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
          Todavía no hay vistas de detalle de producto en este rango.
        </p>
        <p className="text-sm">
          Ampliá el rango o esperá nuevas visitas para detectar qué productos ya están captando interés.
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
        <Bar dataKey="views" fill="var(--color-views)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
