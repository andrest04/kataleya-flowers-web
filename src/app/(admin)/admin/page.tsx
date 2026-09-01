import Link from 'next/link';

import { getAdminCategories } from '@/features/admin/queries/categories';
import { getAdminProductCategoryCounts, getAdminProductList } from '@/features/admin/queries/products';
import { getComplaints } from '@/features/complaints/queries/complaints';

export const metadata = { title: 'Dashboard' };

export default async function AdminDashboardPage() {
  const [categories, complaints] = await Promise.all([getAdminCategories(), getComplaints()]);
  const [productCounts, missingPhotos, hidden] = await Promise.all([
    getAdminProductCategoryCounts(categories.map((category) => category.id)),
    getAdminProductList({ page: 1, gallery: 'at-most-one-image' }),
    getAdminProductList({ page: 1, status: 'inactive' }),
  ]);
  const totalProducts = Object.values(productCounts).reduce((sum, count) => sum + count, 0);
  const pendingComplaints = complaints.filter((complaint) => complaint.status !== 'RESPONDIDO').length;
  const emptyCategories = categories.filter((category) => (productCounts[category.id] ?? 0) === 0).length;

  const health = [
    {
      href: '/admin/productos?vista=incomplete',
      label: 'Les falta foto',
      value: missingPhotos.total,
      detail: 'Productos publicados con una sola imagen o ninguna.',
    },
    {
      href: '/admin/productos?estado=inactive',
      label: 'Ocultos del catálogo',
      value: hidden.total,
      detail: 'Productos que nadie ve en el sitio público.',
    },
    {
      href: '/admin/categorias?filter=without-active-products',
      label: 'Categorías vacías',
      value: emptyCategories,
      detail: 'Categorías sin ningún producto asignado.',
    },
  ];

  const cards = [
    {
      href: '/admin/categorias',
      label: 'Categorías',
      value: categories.length,
      detail: `${totalProducts} producto${totalProducts !== 1 ? 's' : ''} en total`,
    },
    {
      href: '/admin/productos',
      label: 'Productos',
      value: totalProducts,
      detail: 'Ver, buscar y editar todo el catálogo',
    },
    {
      href: '/admin/reclamos',
      label: 'Reclamos',
      value: complaints.length,
      detail: `${pendingComplaints} pendiente${pendingComplaints !== 1 ? 's' : ''} de respuesta`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold" style={{ color: 'var(--color-dark)' }}>
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
          Resumen del panel de administración.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl p-6 transition-opacity hover:opacity-80"
            style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-serif font-semibold" style={{ color: 'var(--color-primary)' }}>
              {card.value}
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
              {card.detail}
            </p>
          </Link>
        ))}
      </div>

      <section aria-labelledby="salud-catalogo" className="space-y-3">
        <h2
          id="salud-catalogo"
          className="text-lg font-serif font-semibold"
          style={{ color: 'var(--color-dark)' }}
        >
          Pendientes del catálogo
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {health.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl p-5 transition-opacity hover:opacity-80"
              style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)' }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
                {item.label}
              </p>
              <p
                className="mt-2 text-2xl font-serif font-semibold"
                style={{ color: item.value > 0 ? 'var(--color-primary)' : 'var(--color-accent)' }}
              >
                {item.value}
              </p>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
                {item.detail}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
