import { NextRequest, NextResponse } from 'next/server';

import { getFlowerTypeUsage } from '@/features/admin/queries/flowerTypes';
import { AdminAuthError, requireAdmin } from '@/features/admin/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json(
        { error: err.code === 'UNAUTHENTICATED' ? 'Unauthorized' : 'Forbidden' },
        { status: err.code === 'UNAUTHENTICATED' ? 401 : 403 },
      );
    }
    throw err;
  }

  const name = request.nextUrl.searchParams.get('name');
  if (!name) {
    return NextResponse.json({ products: [] });
  }

  const products = await getFlowerTypeUsage(name);
  return NextResponse.json({ products });
}
