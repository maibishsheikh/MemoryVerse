import { NextRequest, NextResponse } from 'next/server';
import { getChildReviews } from '@/lib/db/repo';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const reviews = getChildReviews(params.childId);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch review schedule' }, { status: 500 });
  }
}
