import { LuPlus, LuExternalLink } from 'react-icons/lu';
import {
  getProductsPerCategory,
  getPriceDistribution,
  getColorDistribution,
  getFlowerTypeDistribution,
  getInventoryStatus,
  getRecentActivity,
} from '@/features/admin/queries/dashboard';
import { DashboardTabs } from '@/features/admin/components/dashboard';
import { Button } from '@/components/ui';

export default async function AdminDashboardPage() {
  const [
    productsPerCategory,
    priceDistribution,
    colorDistribution,
    flowerTypeDistribution,
    inventory,
    recentActivity,
  ] = await Promise.all([
    getProductsPerCategory(),
    getPriceDistribution(),
    getColorDistribution(),
    getFlowerTypeDistribution(),
    getInventoryStatus(),
    getRecentActivity(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-2xl font-serif font-semibold"
          style={{ color: 'var(--color-dark)' }}
        >
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Resumen general de tu tienda
        </p>
      </div>

      <DashboardTabs
        inventory={inventory}
        categoryCount={productsPerCategory.length}
        productsPerCategory={productsPerCategory}
        priceDistribution={priceDistribution}
        colorDistribution={colorDistribution}
        flowerTypeDistribution={flowerTypeDistribution}
        recentActivity={recentActivity}
      />

      <div>
        <h2
          className="text-lg font-serif font-semibold mb-4"
          style={{ color: 'var(--color-dark)' }}
        >
          Accesos rápidos
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button href="/admin/productos/nuevo" variant="primary" size="sm">
            <LuPlus size={16} />
            Nuevo producto
          </Button>
          <Button href="/admin/categorias/nueva" variant="primary" size="sm">
            <LuPlus size={16} />
            Nueva categoría
          </Button>
          <Button href="/catalogo" variant="ghost" size="sm" external>
            <LuExternalLink size={16} />
            Ver catálogo público
          </Button>
        </div>
      </div>
    </div>
  );
}
