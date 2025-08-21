import { getSupabaseServer } from '@/lib/supabase-server'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Link from 'next/link'
import FeedbackList from './FeedbackList'

export const dynamic = 'force-dynamic'

export default async function FeedbackPage() {
  const supabase = getSupabaseServer()
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
            You need to be logged in to view your feedback. Please sign in or create an account to continue.
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

  // Get total feedback count
  const { count: totalFeedback } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get unique sources, segments, and areas for filters
  const { data: sources } = await supabase
    .from('feedback')
    .select('source')
    .eq('user_id', user.id)
    .not('source', 'is', null)

  const { data: segments } = await supabase
    .from('feedback')
    .select('user_segment')
    .eq('user_id', user.id)
    .not('user_segment', 'is', null)

  const { data: areas } = await supabase
    .from('feedback')
    .select('product_area')
    .eq('user_id', user.id)
    .not('product_area', 'is', null)

  const uniqueSources = Array.from(new Set(sources?.map(s => s.source) || []))
  const uniqueSegments = Array.from(new Set(segments?.map(s => s.user_segment) || []))
  const uniqueAreas = Array.from(new Set(areas?.map(a => a.product_area) || []))

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Feedback</h1>
        <p className="text-gray-600 mt-2">
          View and manage all your customer feedback with advanced filtering and analysis.
        </p>
        <div className="flex items-center space-x-4 mt-4">
          <span className="text-sm text-gray-500">
            Total: {totalFeedback || 0} feedback items
          </span>
          <Link href="/add-feedback">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
              + Add New Feedback
            </button>
          </Link>
        </div>
      </div>

      <FeedbackList 
        uniqueSources={uniqueSources}
        uniqueSegments={uniqueSegments}
        uniqueAreas={uniqueAreas}
      />
    </div>
  )
} 