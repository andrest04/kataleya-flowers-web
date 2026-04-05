import { NextRequest, NextResponse } from 'next/server';
import { getProductColorUsage } from '@/features/admin/queries/productColors';

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name');
  if (!name) {
    return NextResponse.json({ products: [] });
  }

  const products = await getProductColorUsage(name);
  return NextResponse.json({ products });
}
