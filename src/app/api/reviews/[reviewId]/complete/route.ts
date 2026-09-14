import { NextRequest, NextResponse } from 'next/server';
import { completeReview, recordAnalytics } from '@/lib/db/repo';
import { z } from 'zod';

const CompleteReviewSchema = z.object({
  performanceScore: z.number().min(0).max(100),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const body = await req.json();
    const parsed = CompleteReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid review completion payload' }, { status: 400 });
    }

    const result = completeReview(params.reviewId, parsed.data.performanceScore);
    recordAnalytics(undefined, 'review_completed', {
      reviewId: params.reviewId,
      performanceScore: parsed.data.performanceScore,
      ...result,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in review completion:', error);
    return NextResponse.json({ error: 'Failed to complete review' }, { status: 500 });
  }
}
