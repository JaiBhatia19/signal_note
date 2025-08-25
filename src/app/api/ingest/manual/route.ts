import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { createDemoAnalysis, simulateDelay } from '@/lib/demo';
import { isDemoMode } from '@/lib/env';

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (isDemoMode()) {
      await simulateDelay(1500);
      return NextResponse.json({
        success: true,
        message: 'Feedback submitted successfully in demo mode'
      });
    }

    const supabase = supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text, source, user_segment, product_area } = body;

    // Validate required fields
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Feedback text is required and cannot be empty' 
      }, { status: 400 });
    }

    if (text.length > 1000) {
      return NextResponse.json({ 
        error: 'Feedback text must be 1000 characters or less' 
      }, { status: 400 });
    }

    // Prepare feedback item
    const feedbackItem = {
      text: text.trim(),
      source: source?.trim() || 'manual',
      user_segment: user_segment?.trim() || null,
      product_area: product_area?.trim() || null,
      created_at: new Date().toISOString(),
      owner_id: user.id
    };

    // Insert into database
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedbackItem])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: 'Failed to save feedback' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      id: data.id
    });

  } catch (error) {
    console.error('Manual feedback error:', error);
    return NextResponse.json({ 
      error: 'Failed to submit feedback' 
    }, { status: 500 });
  }
}
