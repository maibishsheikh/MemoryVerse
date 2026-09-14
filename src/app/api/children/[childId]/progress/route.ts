import { NextRequest, NextResponse } from 'next/server';
import { getChildProgress } from '@/lib/db/repo';

export async function GET(
  req: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const progress = getChildProgress(params.childId);
    if (!progress) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}
