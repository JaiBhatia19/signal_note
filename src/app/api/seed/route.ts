import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function POST() {
  try {
    const supabase = getSupabaseServer()
    
    // Create a test user account
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: 'test@signalnote.com',
      password: 'testpassword123',
    })

    if (signUpError) {
      return NextResponse.json({ 
        error: 'Failed to create test user', 
        details: signUpError.message 
      }, { status: 500 })
    }

    if (user) {
      // Add some sample feedback data for the test user
      const { error: feedbackError } = await supabase
        .from('feedback')
        .insert([
          {
            owner_id: user.id,
            source: 'manual',
            text: 'The onboarding process is too complicated. Users get confused at step 3.',
            user_segment: 'new_users',
            product_area: 'onboarding'
          },
          {
            owner_id: user.id,
            source: 'email',
            text: 'Love the new dashboard! Much easier to navigate than before.',
            user_segment: 'power_users',
            product_area: 'dashboard'
          },
          {
            owner_id: user.id,
            source: 'slack',
            text: 'We need better search functionality. Current search is too basic.',
            user_segment: 'product_managers',
            product_area: 'search'
          }
        ])

      if (feedbackError) {
        console.warn('Could not create sample feedback:', feedbackError.message)
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Test user created successfully',
        credentials: {
          email: 'test@signalnote.com',
          password: 'testpassword123'
        },
        note: 'Use these credentials to sign in to the app'
      })
    }

    return NextResponse.json({ 
      error: 'User creation failed' 
    }, { status: 500 })

  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
} 