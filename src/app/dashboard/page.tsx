import { getSupabaseServer } from '@/lib/supabase-server'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
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
            You need to be logged in to view your dashboard. Please sign in or create an account to continue.
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

  // Get feedback count for this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  const { count: weeklyFeedback } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', weekAgo.toISOString())

  // Get total feedback count
  const { count: totalFeedback } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get recent feedback items with enhanced data
  const { data: recentFeedback } = await supabase
    .from('feedback')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get feature requests
  const { data: featureRequests } = await supabase
    .from('feature_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  // Get analytics data
  const { data: analytics } = await supabase.rpc('get_feedback_analytics', {
    search_user_id: user.id,
    days_back: 30
  })

  // Get top user segments
  const { data: topSegments } = await supabase
    .from('feedback')
    .select('user_segment')
    .eq('user_id', user.id)
    .not('user_segment', 'is', null)
    .limit(5)

  // Get top product areas
  const { data: topAreas } = await supabase
    .from('feedback')
    .select('product_area')
    .eq('user_id', user.id)
    .not('product_area', 'is', null)
    .limit(5)

  const analyticsData = analytics?.[0] || {}
  const uniqueSegments = Array.from(new Set(topSegments?.map(s => s.user_segment) || []))
  const uniqueAreas = Array.from(new Set(topAreas?.map(a => a.product_area) || []))

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600'
    if (score >= 0.4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getUrgencyColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600'
    if (score >= 0.5) return 'text-orange-600'
    return 'text-green-600'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.email}! Here's what's happening with your feedback.</p>
        </div>
        <Link href="/add-feedback">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            + Add Feedback
          </button>
        </Link>
      </div>

      {/* Enhanced Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{totalFeedback || 0}</div>
            <div className="text-gray-600">Total Feedback</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{weeklyFeedback || 0}</div>
            <div className="text-gray-600">This Week</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getSentimentColor(analyticsData.avg_sentiment || 0.5)}`}>
              {analyticsData.avg_sentiment ? (analyticsData.avg_sentiment * 100).toFixed(0) : 'N/A'}%
            </div>
            <div className="text-gray-600">Avg Sentiment</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getUrgencyColor(analyticsData.avg_urgency || 0.5)}`}>
              {analyticsData.avg_urgency ? (analyticsData.avg_urgency * 100).toFixed(0) : 'N/A'}%
            </div>
            <div className="text-gray-600">Avg Urgency</div>
          </div>
        </Card>
      </div>

      {/* User Segments & Product Areas */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top User Segments</h3>
          <div className="space-y-2">
            {uniqueSegments.length > 0 ? (
              uniqueSegments.map((segment, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700">{segment}</span>
                  <Badge variant="default">{topSegments?.filter(s => s.user_segment === segment).length || 0}</Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No user segments yet</p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Product Areas</h3>
          <div className="space-y-2">
            {uniqueAreas.length > 0 ? (
              uniqueAreas.map((area, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700">{area}</span>
                  <Badge variant="default">{topAreas?.filter(a => a.product_area === area).length || 0}</Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No product areas yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Feedback with Enhanced Display */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Feedback</h2>
          <Link href="/feedback" className="text-blue-600 hover:text-blue-700 text-sm">
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {recentFeedback && recentFeedback.length > 0 ? (
            recentFeedback.map((feedback: any) => (
              <div key={feedback.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-gray-700 text-sm line-clamp-2 mb-2">
                    {feedback.content}
                  </p>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <Badge variant="default" className="text-xs">
                      {feedback.source}
                    </Badge>
                    {feedback.user_segment && (
                      <Badge variant="default" className="text-xs">
                        {feedback.user_segment}
                      </Badge>
                    )}
                    {feedback.product_area && (
                      <Badge variant="default" className="text-xs">
                        {feedback.product_area}
                      </Badge>
                    )}
                    <Badge className={`text-xs ${getPriorityColor(feedback.priority)}`}>
                      {feedback.priority}
                    </Badge>
                    {feedback.sentiment_score && (
                      <span className={`text-xs font-medium ${getSentimentColor(feedback.sentiment_score)}`}>
                        Sentiment: {(feedback.sentiment_score * 100).toFixed(0)}%
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <p className="text-gray-500 mb-4">No feedback yet. Start collecting customer insights!</p>
              <Link href="/add-feedback">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Add Your First Feedback
                </button>
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* Feature Requests */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Feature Requests</h2>
          <Link href="/insights" className="text-blue-600 hover:text-blue-700 text-sm">
            Generate More →
          </Link>
        </div>
        <div className="space-y-3">
          {featureRequests && featureRequests.length > 0 ? (
            featureRequests.map((fr: any) => (
              <div key={fr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{fr.title}</h3>
                  <p className="text-sm text-gray-600">{fr.description}</p>
                  {fr.impact_score && (
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">Impact: {fr.impact_score}/10</span>
                      {fr.roi_estimate && (
                        <span className="text-xs text-gray-500">ROI: {fr.roi_estimate}%</span>
                      )}
                    </div>
                  )}
                </div>
                <Badge 
                  variant={
                    fr.status === 'shipped' ? 'success' : 
                    fr.status === 'in_progress' ? 'warning' : 'default'
                  }
                >
                  {fr.status.replace('_', ' ')}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-3">No feature requests yet.</p>
              <p className="text-sm text-gray-400">Use the Insights page to generate feature requests from your feedback.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/add-feedback">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
              <div className="text-blue-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Add Feedback</h3>
              <p className="text-sm text-gray-600">Record customer feedback</p>
            </div>
          </Link>
          <Link href="/search">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
              <div className="text-blue-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Search Feedback</h3>
              <p className="text-sm text-gray-600">Find specific insights</p>
            </div>
          </Link>
          <Link href="/insights">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
              <div className="text-blue-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Generate Insights</h3>
              <p className="text-sm text-gray-600">AI-powered analysis</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  )
} 