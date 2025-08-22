'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processAuth = async () => {
      try {
        console.log('Starting authentication process...')
        
        // Supabase magic links come with tokens in the URL hash fragment
        // Format: #access_token=...&refresh_token=...
        const hash = window.location.hash
        console.log('URL hash:', hash ? 'Present' : 'Missing')
        
        if (hash && hash.includes('access_token')) {
          console.log('Processing magic link authentication...')
          
          // Use the singleton Supabase client
          console.log('Using singleton Supabase client')

          // Process the hash fragment
          const hashParams = new URLSearchParams(hash.substring(1)) // Remove the # symbol
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          
          console.log('Tokens found:', { 
            accessToken: !!accessToken, 
            refreshToken: !!refreshToken 
          })

          if (accessToken && refreshToken) {
            console.log('Setting Supabase session...')
            
            try {
              // Set the session using the tokens from the hash
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })

              if (error) {
                console.error('Session error:', error)
                throw error
              }

              if (data.user) {
                console.log('User authenticated:', data.user.email)
                
                try {
                  // Check if user has completed onboarding
                  const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('onboarding_completed')
                    .eq('id', data.user.id)
                    .single()

                  if (profileError) {
                    console.log('No profile found, creating one...')
                    // Create profile if it doesn't exist
                    const { error: createError } = await supabase
                      .from('profiles')
                      .insert({
                        id: data.user.id,
                        email: data.user.email,
                        onboarding_completed: false,
                        created_at: new Date().toISOString()
                      })
                    
                    if (createError) {
                      console.error('Profile creation error:', createError)
                      // Don't throw here, just log and continue
                      console.log('Profile creation failed, but continuing...')
                    }
                  }

                  // Determine redirect destination
                  let redirectPath = '/dashboard'
                  if (!profile?.onboarding_completed) {
                    redirectPath = '/onboarding'
                  }

                  console.log('Redirecting to:', redirectPath)
                  // Successfully authenticated, redirect to appropriate page
                  router.push(redirectPath)
                  return
                } catch (profileErr) {
                  console.error('Profile handling error:', profileErr)
                  // If profile creation fails, still redirect to onboarding
                  router.push('/onboarding')
                  return
                }
              } else {
                console.error('No user data returned from session')
                throw new Error('No user data returned')
              }
            } catch (sessionError) {
              console.error('Session setup error:', sessionError)
              throw sessionError
            }
          } else {
            console.error('Missing tokens in hash')
            throw new Error('Missing authentication tokens')
          }
        } else {
          console.error('No access token found in URL hash')
          throw new Error('No authentication tokens found')
        }

        // If we get here, something went wrong
        console.error('Authentication failed - no user data')
        setError('Authentication failed - please try again')
        setIsProcessing(false)
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(err instanceof Error ? err.message : 'Authentication failed')
        setIsProcessing(false)
      }
    }

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.error('Authentication timeout')
      setError('Authentication timed out - please try again')
      setIsProcessing(false)
    }, 30000) // 30 second timeout

    processAuth().finally(() => {
      clearTimeout(timeout)
    })
  }, [router])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing authentication...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return null
} 