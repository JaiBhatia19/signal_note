import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase-service';

export const runtime = "nodejs";

// Temporary in-memory storage as fallback
let tempWaitlist: { email: string; ref_code?: string; created_at: Date }[] = [];

export async function POST(request: NextRequest) {
  try {
    const { email, ref_code } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Try to use database first
    try {
      const supabase = getSupabaseService();
      
      // Check if email already exists
      const { data: existing } = await supabase
        .from('waitlist')
        .select('email')
        .eq('email', email)
        .single();

      if (existing) {
        return NextResponse.json({ 
          message: 'Email already on waitlist',
          existing: true 
        });
      }

      // Insert new email
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert({
          email,
          ref_code,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        throw insertError;
      }

      // Get total count
      const { count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });

      return NextResponse.json({ 
        message: 'Added to waitlist successfully',
        total: count || 0
      });

    } catch (dbError) {
      console.log('Database operation failed, using temporary storage:', dbError);
      
      // Fallback to temporary storage
      const existing = tempWaitlist.find(entry => entry.email === email);
      if (existing) {
        return NextResponse.json({ 
          message: 'Email already on waitlist',
          existing: true 
        });
      }

      tempWaitlist.push({
        email,
        ref_code,
        created_at: new Date()
      });

      return NextResponse.json({ 
        message: 'Added to temporary waitlist',
        total: tempWaitlist.length
      });
    }

  } catch (error) {
    console.error('Waitlist insert error:', error);
    return NextResponse.json({ error: 'Failed to add to waitlist' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Try to use database first
    try {
      const supabase = getSupabaseService();
      
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return NextResponse.json({ 
        waitlist: data,
        total: data?.length || 0,
        source: 'database'
      });

    } catch (dbError) {
      console.log('Database query failed, using temporary storage:', dbError);
      
      // Fallback to temporary storage
      return NextResponse.json({ 
        waitlist: tempWaitlist,
        total: tempWaitlist.length,
        source: 'temporary'
      });
    }

  } catch (error) {
    console.error('Waitlist query error:', error);
    return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 });
  }
} 