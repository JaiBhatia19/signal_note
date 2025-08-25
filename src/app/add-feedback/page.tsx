import Card from '@/components/Card'
import AddFeedbackForm from './AddFeedbackForm'
import { supabaseServer } from '@/lib/supabase/server';
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AddFeedbackPage() {
  const supabase = supabaseServer()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // If no user, show login prompt instead of redirecting
  if (!user || error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <div className="text-yellow-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to add feedback. Please sign in or create an account to continue.
          </p>
          <div className="space-x-4">
            <Link href="/login">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </Link>
            <Link href="/login">
              <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors">
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add Customer Feedback</h1>
        <p className="text-gray-600 mt-2">
          Paste Zoom transcript, Slack, or notes here. We'll analyze and store it for future insights.
        </p>
      </div>

      <Card>
        <AddFeedbackForm />
      </Card>
    </div>
  )
} 