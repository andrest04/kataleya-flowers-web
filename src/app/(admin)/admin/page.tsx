import { LuPackage, LuLayoutGrid, LuPlus, LuExternalLink } from 'react-icons/lu';
import { getAdminProducts } from '@/features/admin/queries/products';
import { getAdminCategories } from '@/features/admin/queries/categories';
import { Button } from '@/components/ui';

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-6 flex items-center gap-4"
      style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="flex items-center justify-center w-12 h-12 rounded-lg"
        style={{
          background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
          color: 'var(--color-primary)',
        }}
      >
        {icon}
      </div>
      <div>
        <p className="text-3xl font-semibold" style={{ color: 'var(--color-dark)' }}>
          {value}
        </p>
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {label}
        </p>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);

  const activeProducts = products.filter((p) => p.is_active);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={<LuPackage size={24} />}
          value={products.length}
          label={`Producto${products.length !== 1 ? 's' : ''} en total`}
        />
        <StatCard
          icon={<LuPackage size={24} />}
          value={activeProducts.length}
          label={`Producto${activeProducts.length !== 1 ? 's' : ''} activo${activeProducts.length !== 1 ? 's' : ''}`}
        />
        <StatCard
          icon={<LuLayoutGrid size={24} />}
          value={categories.length}
          label={`Categoría${categories.length !== 1 ? 's' : ''}`}
        />
      </div>

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
