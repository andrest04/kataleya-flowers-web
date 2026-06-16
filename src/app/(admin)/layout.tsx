import { redirect } from 'next/navigation';

import AdminSidebar from '@/features/admin/components/AdminSidebar';
import { isAdminUserAppwrite } from '@/features/admin/utils/adminMembership.appwrite';
import { getUser } from '@/lib/appwrite/account';
import { getSessionCookie } from '@/lib/appwrite/cookies';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Appwrite path: resolve session cookie → validate user → check admin membership.
  const sessionSecret = await getSessionCookie();
  if (!sessionSecret) {
    redirect('/login');
  }

  const user = await getUser(sessionSecret);
  if (!user) {
    redirect('/login');
  }

  const isAdmin = await isAdminUserAppwrite(user.$id);
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
