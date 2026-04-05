import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProductColorUsage } from '@/features/admin/queries/productColors';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const name = request.nextUrl.searchParams.get('name');
  if (!name) {
    return NextResponse.json({ products: [] });
  }

  const products = await getProductColorUsage(name);
  return NextResponse.json({ products });
}
