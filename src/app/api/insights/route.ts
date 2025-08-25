import { NextRequest, NextResponse } from 'next/server';
import { isDemoMode } from '@/lib/env';
import { loadDemoClusters, simulateDelay } from '@/lib/demo';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // In demo mode, return fixture clusters
    if (isDemoMode()) {
      await simulateDelay(800);
      const clusters = loadDemoClusters();
      return NextResponse.json({ 
        clusters,
        total_feedback: 15,
        demo: true 
      });
    }

    const supabase = supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get existing clusters first
    const { data: clusters, error: clustersError } = await supabase
      .from('clusters')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (clustersError) {
      console.error('Clusters fetch error:', clustersError);
    }

    // If no clusters, get basic feedback insights
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (feedbackError) {
      return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }

    return NextResponse.json({ 
      clusters: clusters || [],
      total_feedback: feedback?.length || 0,
      message: clusters?.length ? 'Clusters loaded successfully' : 'No clusters found. Try rebuilding clusters.'
    });

  } catch (error) {
    console.error('Insights error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 