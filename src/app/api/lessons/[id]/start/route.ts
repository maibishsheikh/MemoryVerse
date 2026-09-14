import { NextRequest, NextResponse } from 'next/server';
import { startAttempt, recordAnalytics } from '@/lib/db/repo';
import { z } from 'zod';

const StartSchema = z.object({
  childId: z.string(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parsed = StartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const attemptId = startAttempt(parsed.data.childId, params.id);
    recordAnalytics(parsed.data.childId, 'lesson_started', { lessonId: params.id, attemptId });

    return NextResponse.json({ attemptId });
  } catch (error) {
    console.error('Error in POST /api/lessons/[id]/start:', error);
    return NextResponse.json({ error: 'Failed to start lesson attempt' }, { status: 500 });
  }
}
