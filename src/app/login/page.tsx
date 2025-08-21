'use client'

import { useState } from 'react'

export const dynamic = 'force-dynamic'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Debug: Check if component is rendering
  console.log('LoginPage component rendered')
  console.log('Environment check - NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted!') // Debug: Check if form submission is working
    setLoading(true)
    setError('')

    try {
      console.log('Attempting to create Supabase client...')
      const supabase = getSupabaseBrowser()
      console.log('Supabase client created, attempting authentication...')
      
      if (isSignUp) {
        console.log('Signing up with email:', email)
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        console.log('Sign up successful')
        alert('Check your email for the confirmation link!')
      } else {
        console.log('Signing in with email:', email)
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        console.log('Sign in successful, redirecting to dashboard')
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Authentication error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isSignUp ? 'Get started with SignalNote' : 'Welcome back to SignalNote'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" onChange={() => console.log('Form changed')}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              console.log('Email changed:', e.target.value) // Debug: Check if input changes are working
              setEmail(e.target.value)
            }}
            required
          />
          
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              console.log('Password changed:', e.target.value) // Debug: Check if input changes are working
              setPassword(e.target.value)
            }}
            required
          />

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            onClick={() => console.log('Button clicked!')} // Debug: Check if button is clickable
          >
            {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </Card>
    </div>
  )
} 