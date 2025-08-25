'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Badge from '@/components/Badge'
import { supabaseBrowserClient } from '@/lib/supabase/client';

export default function SettingsForm() {
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setMessage] = useState('')
  const [userProfile, setUserProfile] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkSubscription = async () => {
      const supabase = supabaseBrowserClient
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setIsPro((profile as any).role === 'pro')
          setUserProfile(profile)
        }
      }
    }

    checkSubscription()

    // Check for success/cancel from Stripe
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    const upgrade = searchParams.get('upgrade')

    if (success) {
      setIsPro(true)
      setMessage('Welcome to SignalNote Pro! You now have access to all features.')
    } else if (canceled) {
      setMessage('Payment was canceled. You can try again anytime.')
    } else if (upgrade) {
      setMessage('Upgrade to Pro to access Search and Insights features!')
    }
  }, [searchParams])

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setMessage('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = supabaseBrowserClient
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Subscription</h2>
          {isPro && <Badge variant="success">Pro Active</Badge>}
        </div>

        <div className="space-y-4">
          {!isPro ? (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Upgrade to Pro</h3>
              <p className="text-blue-700 text-sm mb-4">
                Get access to advanced features including semantic search, AI clustering, and unlimited feedback analysis.
              </p>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Semantic search across all feedback
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  AI-powered clustering and insights
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Advanced analytics and reporting
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Priority support
                </div>
              </div>
              <div className="mt-4">
                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Processing...' : 'Upgrade to Pro - $100/month'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Pro Features Active</h3>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Semantic search across all feedback</li>
                <li>• AI-powered clustering and insights</li>
                <li>• Advanced analytics and reporting</li>
                <li>• Priority support</li>
              </ul>
              <p className="text-green-600 text-sm mt-3">
                Your Pro subscription is active. Manage billing through your Stripe dashboard.
              </p>
            </div>
          )}
        </div>
      </Card>

      {error && (
        <Card>
          <div className="text-center">
            <div className={`text-sm p-3 rounded ${
              error.includes('Welcome') || error.includes('Pro') 
                ? 'text-green-600 bg-green-50 border border-green-200' 
                : 'text-blue-600 bg-blue-50 border border-blue-200'
            }`}>
              {error}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="text-gray-900">{userProfile?.email || 'Loading...'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="text-gray-900">{userProfile?.name || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Member since:</span>
            <span className="text-gray-900">
              {userProfile?.created_at 
                ? new Date(userProfile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })
                : 'Loading...'
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Plan:</span>
            <span className="text-gray-900">
              {isPro ? 'Pro' : 'Free'}
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </Card>
    </>
  )
} 