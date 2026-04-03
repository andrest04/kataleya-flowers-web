'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/primitives/chart';
import type { ChartConfig } from '@/components/ui/primitives/chart';
import type { DailyEventCount } from '@/features/admin/queries/analytics';

interface Props {
  data: DailyEventCount[];
}

const chartConfig: ChartConfig = {
  views: { label: 'Vistas', color: 'var(--chart-1)' },
  clicks: { label: 'Clics', color: 'var(--chart-3)' },
} satisfies ChartConfig;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

export default function DailyViewsChart({ data }: Props) {
  const hasData = data.some((d) => d.views > 0 || d.clicks > 0);

  if (!hasData) {
    return (
      <p className="text-sm text-center py-12" style={{ color: 'var(--color-muted)' }}>
        Sin datos de actividad todavía
      </p>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="w-full [&>div]:!aspect-auto min-h-[300px]"
    >
      <AreaChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="views"
          fill="var(--color-views)"
          fillOpacity={0.2}
          stroke="var(--color-views)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="clicks"
          fill="var(--color-clicks)"
          fillOpacity={0.2}
          stroke="var(--color-clicks)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
