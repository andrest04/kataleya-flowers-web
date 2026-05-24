import { redirect } from 'next/navigation';

import AdminSidebar from '@/features/admin/components/AdminSidebar';
import { isAdminUser } from '@/features/admin/utils/adminMembership';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const isAdmin = await isAdminUser(supabase, user.id);
  if (!isAdmin) {
    redirect('/login?error=forbidden');
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-cream)' }}>
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
