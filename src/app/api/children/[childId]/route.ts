import { NextRequest, NextResponse } from 'next/server';
import { getChild } from '@/lib/db/repo';

export async function GET(
  req: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const child = getChild(params.childId);
    if (!child) {
      return NextResponse.json({ error: 'Child profile not found' }, { status: 404 });
    }
    return NextResponse.json(child);
  } catch (error) {
    console.error('Error in GET /api/children/[childId]:', error);
    return NextResponse.json({ error: 'Failed to fetch child profile' }, { status: 500 });
  }
}
