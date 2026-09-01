'use client';

import { ClipboardList, Flower2, House, LayoutDashboard, Settings, Tags } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import LogoutButton from '@/features/admin/components/LogoutButton';

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/inicio', label: 'Inicio', icon: House },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
  { href: '/admin/categorias', label: 'Categorías', icon: Tags },
  { href: '/admin/productos', label: 'Productos', icon: Flower2 },
  { href: '/admin/reclamos', label: 'Reclamos', icon: ClipboardList },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-x-0 bottom-0 z-50 flex min-h-0 items-stretch border-t border-(--color-border) bg-(--color-white) px-2 py-2 md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:flex-col md:border-t-0 md:border-r md:px-4 md:py-6">
      <div className="mb-8 hidden px-3 md:block">
        <span className="font-serif text-lg font-semibold text-(--color-primary)">Kataleya</span>
        <p className="mt-0.5 text-xs text-(--color-muted)">Panel admin</p>
      </div>

      <nav
        aria-label="Navegación de administración"
        className="flex flex-1 items-stretch gap-1 overflow-x-auto md:block md:space-y-1 md:overflow-visible"
      >
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-w-16 flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) md:min-w-0 md:flex-row md:px-3 md:py-2.5 md:text-sm ${
                isActive
                  ? 'bg-(--color-surface) font-semibold text-(--color-primary)'
                  : 'text-(--color-muted) hover:bg-(--color-surface) hover:text-(--color-dark)'
              }`}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-stretch border-l border-(--color-border) pl-1 md:mt-auto md:block md:border-t md:border-l-0 md:pt-4 md:pl-0">
        <LogoutButton />
      </div>
    </aside>
  );
}
