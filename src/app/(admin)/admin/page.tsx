import Link from 'next/link';

import { getAdminCategories } from '@/features/admin/queries/categories';
import { getAdminProductCategoryCounts } from '@/features/admin/queries/products';
import { getComplaints } from '@/features/complaints/queries/complaints';

export const metadata = { title: 'Dashboard' };

export default async function AdminDashboardPage() {
  const [categories, complaints] = await Promise.all([getAdminCategories(), getComplaints()]);
  const productCounts = await getAdminProductCategoryCounts(categories.map((category) => category.id));
  const totalProducts = Object.values(productCounts).reduce((sum, count) => sum + count, 0);
  const pendingComplaints = complaints.filter((complaint) => complaint.status !== 'RESPONDIDO').length;

  const cards = [
    {
      href: '/admin/categorias',
      label: 'Categorías',
      value: categories.length,
      detail: `${totalProducts} producto${totalProducts !== 1 ? 's' : ''} en total`,
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
    </div>
  );
}
