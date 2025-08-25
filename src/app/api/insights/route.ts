import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/guards';
import { getUserClusters } from '@/lib/clustering';

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const clusters = await getUserClusters(user.id);

    return NextResponse.json({ clusters });
  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 