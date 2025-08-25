import { NextResponse } from 'next/server';
export const runtime = "nodejs";

import { supabaseServer } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = supabaseServer()
    
    // Create a test user account
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Insert some sample feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback_items')
      .insert([
        { text: 'The app is really slow when loading large datasets', user_id: user.id, source: 'web' },
        { text: 'Great user interface, very intuitive!', user_id: user.id, source: 'mobile' },
        { text: 'Search functionality could be improved', user_id: user.id, source: 'web' }
      ])
      .select()

    if (feedbackError) {
      return NextResponse.json({ error: feedbackError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Database seeded successfully',
      user: user.id,
      feedback: feedback.length
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 