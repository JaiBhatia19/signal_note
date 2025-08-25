import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/guards';
import { getReferralStats } from '@/lib/referrals';

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

    const stats = await getReferralStats(user.id);

    if (!stats) {
      return NextResponse.json(
        { error: 'Failed to fetch referral stats' },
        { status: 500 }
      );
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Referrals API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 