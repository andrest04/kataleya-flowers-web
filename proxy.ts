import { type NextRequest, NextResponse } from 'next/server';

import { isAdminUser } from '@/features/admin/utils/adminMembership';
import { createClient } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  const { supabase, response } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user ? await isAdminUser(supabase, user.id) : false;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/login?error=forbidden', request.url));
    }
  }

  if (pathname === '/login' && user && isAdmin) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
