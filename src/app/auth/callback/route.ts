import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle auth errors
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return NextResponse.redirect(`${origin}/login?error=${error}&description=${errorDescription}`)
  }

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Session exchange error:', error)
        return NextResponse.redirect(`${origin}/login?error=session_exchange_failed&description=${error.message}`)
      }

      if (data.user) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single()

        // Determine redirect destination
        let redirectPath = next
        if (next === '/dashboard' && !profile?.onboarding_completed) {
          redirectPath = '/onboarding'
        }

        // Successfully authenticated, redirect to appropriate page
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    } catch (err) {
      console.error('Auth callback exception:', err)
      return NextResponse.redirect(`${origin}/login?error=callback_exception&description=An unexpected error occurred`)
    }
  }

  // If there's no code or other issues, redirect to login
  return NextResponse.redirect(`${origin}/login?error=no_auth_code&description=No authentication code provided`)
} 