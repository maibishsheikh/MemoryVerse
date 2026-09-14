import { NextRequest, NextResponse } from 'next/server';
import { recordAnalytics } from '@/lib/db/repo';
import { z } from 'zod';

const AnalyticsSchema = z.object({
  childId: z.string().optional(),
  eventType: z.string(),
  payload: z.record(z.unknown()).default({}),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AnalyticsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    recordAnalytics(parsed.data.childId, parsed.data.eventType, parsed.data.payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error recording analytics event:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
