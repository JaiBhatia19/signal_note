'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Badge from '@/components/Badge'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function SettingsForm() {
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkSubscription = async () => {
      const supabase = getSupabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_pro')
          .eq('id', user.id)
          .single()
        setIsPro(profile?.is_pro || false)
      }
    }

    checkSubscription()

    // Check for success/cancel from Stripe
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    const upgrade = searchParams.get('upgrade')

    if (success) {
      setIsPro(true)
      alert('Welcome to SignalNote Pro! You now have access to all features.')
    } else if (canceled) {
      alert('Payment was canceled. You can try again anytime.')
    } else if (upgrade) {
      alert('Upgrade to Pro to access Search and Insights features!')
    }
  }, [searchParams])

  const handleCheckout = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const data = await response.json()
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className="mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
              <p className="text-gray-600">
                {isPro ? 'Pro Plan' : 'Free Plan'}
              </p>
            </div>
            <Badge 
              variant={isPro ? 'success' : 'default'}
            >
              {isPro ? 'Active' : 'Free'}
            </Badge>
          </div>

          {!isPro && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Upgrade to Pro</h3>
              <p className="text-blue-700 text-sm mb-3">
                Get access to semantic search, AI-powered insights, and advanced analytics.
              </p>
              <Button
                onClick={handleCheckout}
                disabled={loading}
                size="sm"
              >
                {loading ? 'Processing...' : 'Upgrade to Pro - $100/month'}
              </Button>
            </div>
          )}

          {isPro && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Pro Features Active</h3>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Semantic search across all feedback</li>
                <li>• AI-powered clustering and insights</li>
                <li>• Advanced analytics and reporting</li>
                <li>• Priority support</li>
              </ul>
            </div>
          )}
        </div>
      </Card>

      {error && (
        <Card>
          <div className="text-red-600 text-center">
            {error}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="text-gray-900">user@example.com</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Member since:</span>
            <span className="text-gray-900">January 2024</span>
          </div>
        </div>
      </Card>
    </>
  )
} 