import { NextRequest, NextResponse } from 'next/server';

import { getProductColorUsage } from '@/features/admin/queries/productColors';
import { isAdminUser } from '@/features/admin/utils/adminMembership';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

  const products = await getProductColorUsage(name);
  return NextResponse.json({ products });
}
