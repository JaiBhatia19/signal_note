import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = getSupabaseServer();
    
    // Try to access different tables to see which ones work
    const results: any = {};
    
    // Test profiles table
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      results.profiles = { accessible: !profilesError, error: profilesError?.message };
    } catch (e) {
      results.profiles = { accessible: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
    
    // Test waitlist table
    try {
      const { data: waitlistData, error: waitlistError } = await supabase
        .from('waitlist')
        .select('count')
        .limit(1);
      results.waitlist = { accessible: !waitlistError, error: waitlistError?.message };
    } catch (e) {
      results.waitlist = { accessible: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
    
    // Test feedback table
    try {
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('count')
        .limit(1);
      results.feedback = { accessible: !feedbackError, error: feedbackError?.message };
    } catch (e) {
      results.feedback = { accessible: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
    
    // Test events table
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('count')
        .limit(1);
      results.events = { accessible: !eventsError, error: eventsError?.message };
    } catch (e) {
      results.events = { accessible: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
    
    return NextResponse.json({
      message: 'Table accessibility test',
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 