import { NextResponse } from 'next/server';
export const runtime = "nodejs";

import { env } from '@/lib/env';

export async function GET() {
  try {
    const healthStatus = {
      ok: true,
      timestamp: new Date().toISOString(),
      envs: Object.keys(env).filter(key => env[key as keyof typeof env]),
      services: {
        supabase: 'configured',
        openai: env.OPENAI_API_KEY ? 'configured' : 'not_configured',
      }
    };

    return NextResponse.json(healthStatus);
  } catch (error) {
    return NextResponse.json(
      { error: 'Health check failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 