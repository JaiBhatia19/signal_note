'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isMagicLink, setIsMagicLink] = useState(false)
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/app')
      }
    }
    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const supabase = createClient()
      
      if (isPasswordReset) {
        // Send password reset email
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/settings`
        })
        if (error) throw error
        
        setMessage('Password reset email sent! Check your inbox and click the link to reset your password.')
        setIsPasswordReset(false)
      } else if (isMagicLink) {
        // Send magic link
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        if (error) throw error
        
        setMessage('Magic link sent! Check your email and click the link to sign in instantly.')
        setIsMagicLink(false)
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        if (error) throw error
        
        setMessage('Account created! Check your email for the confirmation link. You can also sign in directly.')
        setIsSignUp(false)
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        // Check if user has completed onboarding
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', data.user.id)
            .single()
          
          if (profile?.onboarding_completed) {
            router.push('/app')
          } else {
            router.push('/onboarding')
          }
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = () => {
    setIsMagicLink(true)
    setIsSignUp(false)
    setIsPasswordReset(false)
    setError('')
    setMessage('')
  }

  const handlePasswordAuth = () => {
    setIsMagicLink(false)
    setIsPasswordReset(false)
    setError('')
    setMessage('')
  }

  const handlePasswordReset = () => {
    setIsPasswordReset(true)
    setIsMagicLink(false)
    setIsSignUp(false)
    setError('')
    setMessage('')
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isPasswordReset ? 'Reset Password' :
             isMagicLink ? 'Sign In with Magic Link' : 
             isSignUp ? 'Create Account' : 'Sign In'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isPasswordReset ? 'Enter your email to receive a password reset link' :
             isMagicLink ? 'Get a secure link sent to your email' :
             isSignUp ? 'Get started with SignalNote' : 'Welcome back to SignalNote'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          {!isMagicLink && !isPasswordReset && (
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
              <div className="font-medium">Error:</div>
              {error}
            </div>
          )}

          {message && (
            <div className="text-green-600 text-sm bg-green-50 p-3 rounded border border-green-200">
              <div className="font-medium">Success:</div>
              {message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Processing...' : 
             isPasswordReset ? 'Send Reset Link' :
             isMagicLink ? 'Send Magic Link' :
             isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          {!isMagicLink && !isPasswordReset && (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleMagicLink}
              >
                Sign in with Magic Link
              </Button>
              
              <button
                type="button"
                onClick={handlePasswordReset}
                className="w-full text-sm text-blue-600 hover:text-blue-500 text-center"
              >
                Forgot your password?
              </button>
            </>
          )}

          {isMagicLink && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handlePasswordAuth}
            >
              Sign in with Password
            </Button>
          )}

          {isPasswordReset && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handlePasswordAuth}
            >
              Back to Sign In
            </Button>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setIsMagicLink(false)
                setIsPasswordReset(false)
                setError('')
                setMessage('')
              }}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isSignUp ? 'Already have an account? Sign in' : 
               isMagicLink ? 'Need an account? Sign up' : 
               isPasswordReset ? 'Remember your password? Sign in' :
               "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <p>By continuing, you agree to our</p>
            <div className="mt-1 space-x-2">
              <a href="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</a>
              <span>and</span>
              <a href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 