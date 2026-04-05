import { NextRequest, NextResponse } from 'next/server';
import { getFlowerTypeUsage } from '@/features/admin/queries/flowerTypes';

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name');
  if (!name) {
    return NextResponse.json({ products: [] });
  }

  const products = await getFlowerTypeUsage(name);
  return NextResponse.json({ products });
}
