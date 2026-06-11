import { type NextRequest, NextResponse } from 'next/server';

import { isAdminUser } from '@/features/admin/utils/adminMembership';
import { APPWRITE_SESSION_COOKIE } from '@/lib/appwrite/cookies';

// ─── Appwrite path ────────────────────────────────────────────────────────────
//
// Middleware runs on the Edge runtime where node-appwrite is NOT available.
// The Appwrite path therefore performs cookie-presence-only checks here.
// Full session validation (getUser + isAdminUserAppwrite) runs in the RSC
// (admin)/layout.tsx and in requireAdminAppwrite() on every action — that
// defense-in-depth layer is the real trust boundary; this layer only handles
// redirects for browsers without a session cookie.

function proxyAppwrite(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(APPWRITE_SESSION_COOKIE);

  if (pathname.startsWith('/admin')) {
    if (!hasSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname === '/login' && hasSession) {
    // Best-effort redirect: cookie presence does not guarantee a valid session,
    // but it avoids showing the login form to users who are likely already
    // authenticated. The layout will re-validate and redirect back if needed.
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next({ request });
}

// ─── Supabase path ────────────────────────────────────────────────────────────
//
// Dynamic import avoids evaluating supabase/middleware.ts (and its top-level
// env-var guard) when BACKEND=appwrite and the Supabase vars are unset.

async function proxySupabase(request: NextRequest): Promise<NextResponse> {
  const { createClient } = await import('@/lib/supabase/middleware');
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

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest): Promise<NextResponse> {
  if (process.env.BACKEND === 'appwrite') {
    return proxyAppwrite(request);
  }
  return proxySupabase(request);
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
