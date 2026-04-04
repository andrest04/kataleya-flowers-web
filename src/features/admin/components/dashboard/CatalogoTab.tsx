import type { ProductsPerCategory, PriceDistribution } from '@/features/admin/queries/dashboard';
import ChartCard from './ChartCard';
import ProductsByCategoryChart from './ProductsByCategoryChart';
import PriceDistributionChart from './PriceDistributionChart';

interface CatalogoTabProps {
  productsPerCategory: ProductsPerCategory[];
  priceDistribution: PriceDistribution[];
}

export default function CatalogoTab({
  productsPerCategory,
  priceDistribution,
}: CatalogoTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Productos por categoría" description="Distribución total y activos">
        <ProductsByCategoryChart data={productsPerCategory} />
      </ChartCard>
      <ChartCard title="Distribución de precios" description="Rangos de precio en soles">
        <PriceDistributionChart data={priceDistribution} />
      </ChartCard>
    </div>
  );
}
