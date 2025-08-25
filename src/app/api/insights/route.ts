import { NextRequest, NextResponse } from 'next/server';
export const runtime = "nodejs";

import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For v1, return basic insights without clustering
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback_items')
      .select('*, analyses(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (feedbackError) {
      return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }

    return NextResponse.json({ 
      insights: {
        total_feedback: feedback?.length || 0,
        recent_items: feedback || [],
        message: 'Basic insights available. Advanced clustering will be added in future versions.'
      }
    });

  } catch (error) {
    console.error('Insights error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 