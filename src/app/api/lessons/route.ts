import { NextResponse } from 'next/server';
import { getLessons } from '@/lib/db/repo';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lessons = getLessons();
    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error in GET /api/lessons:', error);
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
  }
}
