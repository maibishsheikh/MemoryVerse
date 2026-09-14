import { NextRequest, NextResponse } from 'next/server';
import { recordQuestionAttempt, recordAnalytics } from '@/lib/db/repo';
import { z } from 'zod';

const QuestionAttemptSchema = z.object({
  childId: z.string(),
  answer: z.unknown(),
  correct: z.boolean(),
  hintsUsed: z.number().default(0),
  timeMs: z.number().default(1000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { attemptId: string; questionId: string } }
) {
  try {
    const body = await req.json();
    const parsed = QuestionAttemptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid question attempt data' }, { status: 400 });
    }

    recordQuestionAttempt({
      attemptId: params.attemptId,
      questionId: params.questionId,
      childId: parsed.data.childId,
      answer: parsed.data.answer,
      correct: parsed.data.correct,
      hintsUsed: parsed.data.hintsUsed,
      timeMs: parsed.data.timeMs,
    });

    recordAnalytics(parsed.data.childId, 'question_answered', {
      attemptId: params.attemptId,
      questionId: params.questionId,
      correct: parsed.data.correct,
      hintsUsed: parsed.data.hintsUsed,
    });

    const feedback = parsed.data.correct
      ? '⭐ Great job! You nailed the pattern!'
      : 'Almost there! Give it another look and keep going!';

    return NextResponse.json({
      correct: parsed.data.correct,
      feedback,
    });
  } catch (error) {
    console.error('Error in question attempt route:', error);
    return NextResponse.json({ error: 'Failed to record question attempt' }, { status: 500 });
  }
}
