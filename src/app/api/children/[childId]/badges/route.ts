import { NextRequest, NextResponse } from 'next/server';
import { getChildProgress } from '@/lib/db/repo';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const progress = getChildProgress(params.childId);
    if (!progress) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }
    return NextResponse.json(progress.badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
  }
}
