'use client';

import { Label,Pie, PieChart } from 'recharts';

import type { ChartConfig } from '@/components/ui/primitives/chart';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/primitives/chart';

interface Props {
  data: { active: number; inactive: number; featured: number; total: number };
}

const chartConfig: ChartConfig = {
  Activos: { label: 'Activos', color: 'var(--chart-3)' },
  Inactivos: { label: 'Inactivos', color: 'var(--chart-1)' },
} satisfies ChartConfig;

export default function InventoryDonut({ data }: Props) {
  const segments = [
    { name: 'Activos', value: data.active, fill: 'var(--chart-3)' },
    { name: 'Inactivos', value: data.inactive, fill: 'var(--chart-1)' },
  ];

  return (
    <ChartContainer config={chartConfig} className="w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        <Pie
          data={segments}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
        >
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null;
              return (
                <text
                  x={viewBox.cx}
                  y={viewBox.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan
                    x={viewBox.cx}
                    y={viewBox.cy}
                    fontSize={24}
                    fontWeight={600}
                    fill="var(--color-dark)"
                  >
                    {data.total}
                  </tspan>
                  <tspan
                    x={viewBox.cx}
                    y={(viewBox.cy ?? 0) + 20}
                    fontSize={12}
                    fill="var(--color-muted)"
                  >
                    total
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  );
}
