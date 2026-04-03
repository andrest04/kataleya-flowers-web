'use client';

import { PieChart, Pie, Label } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/primitives/chart';
import type { ChartConfig } from '@/components/ui/primitives/chart';

interface Props {
  data: { active: number; inactive: number; featured: number; total: number };
}

const chartConfig: ChartConfig = {
  activos: { label: 'Activos', color: 'var(--chart-3)' },
  inactivos: { label: 'Inactivos', color: 'var(--chart-1)' },
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
      </PieChart>
    </ChartContainer>
  );
}
