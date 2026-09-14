import { NextRequest, NextResponse } from 'next/server';
import { getChildren, createChild } from '@/lib/db/repo';
import { z } from 'zod';

const CreateChildSchema = z.object({
  displayName: z.string().min(1).max(50),
  ageBand: z.enum(['explorer', 'builder', 'challenger']),
  avatarKey: z.string().optional().default('mia'),
  parentId: z.string().optional().default('parent_default_001'),
});

export async function GET() {
  try {
    const children = getChildren();
    return NextResponse.json(children);
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json({ error: 'Failed to fetch child profiles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateChildSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 });
    }

    const newChild = createChild(parsed.data.parentId, {
      displayName: parsed.data.displayName,
      ageBand: parsed.data.ageBand,
      avatarKey: parsed.data.avatarKey,
    });

    return NextResponse.json(newChild, { status: 201 });
  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json({ error: 'Failed to create child profile' }, { status: 500 });
  }
}
