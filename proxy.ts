import { type NextRequest, NextResponse } from 'next/server';

import { APPWRITE_SESSION_COOKIE } from '@/lib/appwrite/cookies';

// Proxy (Next.js 16 middleware) guards /admin and /login with a cookie-presence
// check only. Full session validation (getUser + isAdminUserAppwrite) runs in
// the RSC (admin)/layout.tsx and in requireAdminAppwrite() on every action —
// that defense-in-depth layer is the real trust boundary; this layer only
// handles redirects for browsers without a session cookie.

export function proxy(request: NextRequest): NextResponse {
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

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
