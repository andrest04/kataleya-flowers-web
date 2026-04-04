'use client';

import { PieChart, Pie, Label } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/primitives/chart';
import type { ChartConfig } from '@/components/ui/primitives/chart';
import type { WhatsAppBySource } from '@/features/admin/queries/analytics';

interface Props {
  data: WhatsAppBySource[];
}

const chartConfig: ChartConfig = {
  clicks: { label: 'Clics' },
  'Botón flotante': { label: 'Botón flotante', color: 'var(--chart-1)' },
  Hero: { label: 'Hero', color: 'var(--chart-2)' },
  Contacto: { label: 'Contacto', color: 'var(--chart-3)' },
  Producto: { label: 'Producto', color: 'var(--chart-4)' },
} satisfies ChartConfig;

export default function WhatsAppSourceChart({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.clicks, 0);

  if (total === 0) {
    return (
      <div className="py-12 text-center space-y-2" style={{ color: 'var(--color-muted)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
          Todavía no hay clics a WhatsApp en este rango.
        </p>
        <p className="text-sm">
          Este corte te va a mostrar desde qué superficies del sitio empieza el contacto cuando entren nuevos eventos.
        </p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="source" />} />
        <Pie
          data={data}
          dataKey="clicks"
          nameKey="source"
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
                    {total}
                  </tspan>
                  <tspan
                    x={viewBox.cx}
                    y={(viewBox.cy ?? 0) + 20}
                    fontSize={12}
                    fill="var(--color-muted)"
                  >
                    clics
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="source" />} />
      </PieChart>
    </ChartContainer>
  );
}
