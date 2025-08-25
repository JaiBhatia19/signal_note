import { NextResponse } from 'next/server';
import { isDemoMode } from '@/lib/env';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = "nodejs";

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    demo: isDemoMode(),
    services: {
      supabase: 'unknown',
      openai: 'unknown'
    }
  };

  try {
    // Check Supabase connection
    if (!isDemoMode()) {
      const supabase = supabaseServer();
      const { error } = await supabase.from('feedback').select('id').limit(1);
      health.services.supabase = error ? 'error' : 'ok';
    } else {
      health.services.supabase = 'demo_mode';
    }

    // Check OpenAI API key
    health.services.openai = process.env.OPENAI_API_KEY ? 'ok' : 'not_configured';

  } catch (error) {
    console.error('Health check error:', error);
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}