import type { ColorDistribution, FlowerTypeDistribution } from '@/features/admin/queries/dashboard';
import ChartCard from './ChartCard';
import ColorPaletteChart from './ColorPaletteChart';
import FlowerTypeRadar from './FlowerTypeRadar';

interface ProductosTabProps {
  colorDistribution: ColorDistribution[];
  flowerTypeDistribution: FlowerTypeDistribution[];
}

export default function ProductosTab({
  colorDistribution,
  flowerTypeDistribution,
}: ProductosTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Paleta de colores" description="Colores más usados en arreglos activos">
        <ColorPaletteChart data={colorDistribution} />
      </ChartCard>
      <ChartCard title="Tipos de flor" description="Distribución por tipo de flor">
        <FlowerTypeRadar data={flowerTypeDistribution} />
      </ChartCard>
    </div>
  );
}
