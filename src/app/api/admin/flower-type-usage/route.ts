import { NextRequest, NextResponse } from 'next/server';

import { getFlowerTypeUsage } from '@/features/admin/queries/flowerTypes';
import { isAdminUser } from '@/features/admin/utils/adminMembership';
import { isAdminUserAppwrite } from '@/features/admin/utils/adminMembership.appwrite';
import { getUser } from '@/lib/appwrite/account';
import { isAppwriteBackend } from '@/lib/appwrite/config';
import { getSessionCookie } from '@/lib/appwrite/cookies';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  if (isAppwriteBackend()) {
    const sessionSecret = await getSessionCookie();
    if (!sessionSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await getUser(sessionSecret);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const isAdmin = await isAdminUserAppwrite(user.$id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const name = request.nextUrl.searchParams.get('name');
    if (!name) {
      return NextResponse.json({ products: [] });
    }

    const products = await getFlowerTypeUsage(name);
    return NextResponse.json({ products });
  }

  // ── Supabase path ──────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isAdmin = await isAdminUser(supabase, user.id);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const name = request.nextUrl.searchParams.get('name');
  if (!name) {
    return NextResponse.json({ products: [] });
  }

  const products = await getFlowerTypeUsage(name);
  return NextResponse.json({ products });
}
