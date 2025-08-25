import { NextRequest, NextResponse } from 'next/server';
export const runtime = "nodejs";

import { supabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For v1, return a simple response indicating clustering is not yet implemented
    return NextResponse.json({ 
      message: 'Clustering will be implemented in future versions',
      status: 'not_implemented'
    });

  } catch (error) {
    console.error('Cluster rebuild error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 