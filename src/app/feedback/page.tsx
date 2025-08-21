import Card from '@/components/Card'
import Badge from '@/components/Badge'
import { getSupabaseServer } from '@/lib/supabase-server'
import Link from 'next/link'

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

  // Get all feedback for this user
  const { data: feedback } = await supabase
    .from('feedback')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get feedback count by source
  const sourceCounts = feedback?.reduce((acc: any, item: any) => {
    acc[item.source] = (acc[item.source] || 0) + 1
    return acc
  }, {}) || {}

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Feedback</h1>
          <p className="text-gray-600 mt-2">View and manage all your customer feedback</p>
        </div>
        <Link href="/add-feedback">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            + Add Feedback
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{feedback?.length || 0}</div>
            <div className="text-gray-600 text-sm">Total Items</div>
          </div>
        </Card>
        {Object.entries(sourceCounts).map(([source, count]) => (
          <Card key={source}>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{count as number}</div>
              <div className="text-gray-600 text-sm">{source}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Feedback List */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Feedback Items</h2>
          <div className="text-sm text-gray-500">
            {feedback?.length || 0} items
          </div>
        </div>
        
        <div className="space-y-3">
          {feedback && feedback.length > 0 ? (
            feedback.map((item: any) => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {item.content}
                    </p>
                    <div className="flex items-center space-x-3">
                      <Badge variant="default" className="text-xs">
                        {item.source}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
              <p className="text-gray-500 mb-4">Start collecting customer insights to see them here.</p>
              <Link href="/add-feedback">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Add Your First Feedback
                </button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
} 