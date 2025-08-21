'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import Textarea from '@/components/Textarea'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function AddFeedbackForm() {
  const [content, setContent] = useState('')
  const [source, setSource] = useState('Manual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), source })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save feedback')
      }

      setSuccess(true)
      setContent('')
      
      // Show success message for 2 seconds, then redirect
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sampleFeedback = [
    "The app crashes when I try to upload large files. This happens every time with files over 10MB.",
    "I love the new dashboard design! The charts are much clearer and the data visualization is really helpful.",
    "The search function is too slow. It takes 5-10 seconds to return results, which makes it unusable for quick lookups.",
    "The mobile app needs better offline support. When I'm on the train without internet, I can't access my saved documents.",
    "The pricing is too expensive for small teams. We're a startup with 5 people and can't afford $50/user/month."
  ]

  const insertSampleFeedback = (sample: string) => {
    setContent(sample)
    setSource('Manual')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Source
        </label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="Manual">Manual Entry</option>
          <option value="Zoom">Zoom Transcript</option>
          <option value="Slack">Slack</option>
          <option value="Email">Email</option>
          <option value="Survey">Survey</option>
          <option value="Support">Support Ticket</option>
          <option value="User Interview">User Interview</option>
          <option value="App Store Review">App Store Review</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Feedback Content
        </label>
        <Textarea
          placeholder="Paste Zoom transcript, Slack conversation, customer email, or write your notes here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          required
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-1">
          Be specific about what the user is trying to do and what problems they're experiencing.
        </p>
      </div>

      {/* Sample Feedback for Testing */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">💡 Sample Feedback (Click to insert)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {sampleFeedback.map((sample, index) => (
            <button
              key={index}
              type="button"
              onClick={() => insertSampleFeedback(sample)}
              className="text-left p-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded border border-gray-200 hover:border-gray-300 transition-colors"
            >
              {sample.length > 60 ? `${sample.substring(0, 60)}...` : sample}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
          <div className="font-medium">Error:</div>
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-600 text-sm bg-green-50 p-3 rounded border border-green-200">
          <div className="font-medium">Success!</div>
          Feedback saved successfully! Redirecting to dashboard...
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          This feedback will be analyzed and stored for future insights.
        </div>
        <Button
          type="submit"
          disabled={loading || !content.trim()}
          size="lg"
        >
          {loading ? 'Saving...' : 'Save and Analyze'}
        </Button>
      </div>
    </form>
  )
} 