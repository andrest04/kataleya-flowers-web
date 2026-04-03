'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/primitives/chart';
import type { ChartConfig } from '@/components/ui/primitives/chart';

interface Props {
  data: { type: string; count: number }[];
}

const chartConfig: ChartConfig = {
  count: { label: 'Cantidad', color: 'var(--chart-1)' },
} satisfies ChartConfig;

export default function FlowerTypeRadar({ data }: Props) {
  return (
    <ChartContainer config={chartConfig} className="w-full">
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="type" tick={{ fontSize: 12 }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Radar
          dataKey="count"
          fill="var(--color-count)"
          fillOpacity={0.5}
          stroke="var(--color-count)"
        />
      </RadarChart>
    </ChartContainer>
  );
}
