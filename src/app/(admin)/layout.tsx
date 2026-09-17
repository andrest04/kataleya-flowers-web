import AdminSidebar from '@/features/admin/components/AdminSidebar';
import { requireAdminOrRedirect } from '@/features/admin/utils/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminOrRedirect();

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-cream)' }}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-(--color-primary) focus:text-(--color-white) focus:px-4 focus:py-2 focus:rounded focus:font-body focus:text-sm focus:font-medium focus:outline-2 focus:outline-(--color-primary)"
        style={{ zIndex: 200 }}
      >
        Saltar al contenido principal
      </a>
      <AdminSidebar />
      <main id="main-content" tabIndex={-1} className="flex-1 overflow-auto p-4 pb-24 md:p-8">
        {children}
      </main>
    </div>
  );
}
