import { NextRequest, NextResponse } from 'next/server';
import { completeAttempt, recordAnalytics } from '@/lib/db/repo';

export async function POST(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const result = completeAttempt(params.attemptId);

    recordAnalytics(undefined, 'lesson_completed', {
      attemptId: params.attemptId,
      score: result.score,
      masteryStage: result.masteryStage,
      xpAwarded: result.xpAwarded,
      badgesEarned: result.badgesEarned.map(b => b.id),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in complete attempt route:', error);
    return NextResponse.json({ error: 'Failed to complete lesson attempt' }, { status: 500 });
  }
}
