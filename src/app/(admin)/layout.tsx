import type { Metadata } from 'next';

import { Toaster } from '@/components/ui/primitives/sonner';
import AdminSidebar from '@/features/admin/components/AdminSidebar';
import { requireAdminOrRedirect } from '@/features/admin/utils/auth';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminOrRedirect();

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-cream)' }}>
      <AdminSidebar />
      <main id="main-content" tabIndex={-1} className="flex-1 overflow-auto p-4 pb-24 md:p-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
