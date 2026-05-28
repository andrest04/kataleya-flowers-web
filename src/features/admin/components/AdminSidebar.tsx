import Link from 'next/link';

import LogoutButton from '@/features/admin/components/LogoutButton';

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/productos', label: 'Productos' },
  { href: '/admin/categorias', label: 'Categorías' },
  { href: '/admin/reclamos', label: 'Reclamos' },
];

export default function AdminSidebar() {
  return (
    <aside
      className="w-56 min-h-screen flex flex-col py-6 px-4"
      style={{
        background: 'var(--color-white)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      <div className="mb-8 px-3">
        <span
          className="font-serif text-lg font-semibold"
          style={{ color: 'var(--color-primary)' }}
        >
          Kataleya
        </span>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
          Panel admin
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="block px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80"
            style={{ color: 'var(--color-dark)' }}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
        <LogoutButton />
      </div>
    </aside>
  );
}
