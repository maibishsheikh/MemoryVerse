import { NextRequest, NextResponse } from 'next/server';
import { getLesson } from '@/lib/db/repo';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lesson = getLesson(params.id);
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Error in GET /api/lessons/[id]:', error);
    return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 });
  }
}
