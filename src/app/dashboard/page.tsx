import { getSupabaseServer } from '@/lib/supabase-server'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = getSupabaseServer()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user || error) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get feedback analytics
  const { data: feedback } = await supabase
    .from('feedback')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  // Get clusters
  const { data: clusters } = await supabase
    .from('clusters')
    .select('*')
    .eq('owner_id', user.id)
    .order('size', { ascending: false })

  // Calculate insights
  const totalFeedback = feedback?.length || 0
  const avgSentiment = feedback?.length 
    ? feedback.reduce((sum, f) => sum + (f.sentiment || 0.5), 0) / feedback.length
    : 0.5
  const avgUrgency = feedback?.length
    ? feedback.reduce((sum, f) => sum + (f.urgency || 0.5), 0) / feedback.length
    : 0.5

  // Get recent feedback
  const recentFeedback = feedback?.slice(0, 5) || []
  const topClusters = clusters?.slice(0, 3) || []

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

  const formatPercentage = (score: number) => {
    return Math.round(score * 100)
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.name || 'Team'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with your customer feedback today.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalFeedback}</div>
            <div className="text-blue-200">Total Feedback</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">{totalFeedback}</div>
          <div className="text-gray-600">Total Feedback</div>
          <div className="text-sm text-gray-500 mt-1">All time</div>
        </Card>
        
        <Card className="text-center p-6">
          <div className={`text-3xl font-bold mb-2 ${getSentimentColor(avgSentiment)}`}>
            {formatPercentage(avgSentiment)}%
          </div>
          <div className="text-gray-600">Avg Sentiment</div>
          <div className="text-sm text-gray-500 mt-1">Customer happiness</div>
        </Card>
        
        <Card className="text-center p-6">
          <div className={`text-3xl font-bold mb-2 ${getUrgencyColor(avgUrgency)}`}>
            {formatPercentage(avgUrgency)}%
          </div>
          <div className="text-gray-600">Avg Urgency</div>
          <div className="text-sm text-gray-500 mt-1">Issue priority</div>
        </Card>
        
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-purple-600 mb-2">{clusters?.length || 0}</div>
          <div className="text-gray-600">Clusters</div>
          <div className="text-sm text-gray-500 mt-1">AI generated</div>
        </Card>
      </div>

      {/* Top Clusters */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">🎯 Top Clusters</h2>
          <Link href="/insights" className="text-blue-600 hover:text-blue-700 text-sm">
            View All →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {topClusters.map((cluster) => (
            <div key={cluster.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="default" className="text-xs">
                  {cluster.size} items
                </Badge>
                <span className="text-xs text-gray-500">
                  {new Date(cluster.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">{cluster.label}</h3>
              <div className="flex items-center space-x-4 mb-3 text-sm">
                <span className={`${getSentimentColor(cluster.avg_sentiment)}`}>
                  Sentiment: {formatPercentage(cluster.avg_sentiment)}%
                </span>
                <span className={`${getUrgencyColor(cluster.avg_urgency)}`}>
                  Urgency: {formatPercentage(cluster.avg_urgency)}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {cluster.feature_request}
              </p>
              <div className="text-xs text-gray-500">
                {cluster.action_items}
              </div>
            </div>
          ))}
        </div>
        {topClusters.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <p className="text-gray-500 mb-4">No clusters yet. Add some feedback to get started!</p>
            <Link href="/ingest">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Add Feedback
              </button>
            </Link>
          </div>
        )}
      </Card>

      {/* Recent Feedback & Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Feedback */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">📝 Recent Feedback</h2>
            <Link href="/feedback" className="text-blue-600 hover:text-blue-700 text-sm">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentFeedback.map((item) => (
              <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-700 text-sm line-clamp-2 mb-2">
                  {item.text}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex space-x-2">
                    {item.source && (
                      <Badge variant="default" className="text-xs">
                        {item.source}
                      </Badge>
                    )}
                    {item.sentiment && (
                      <Badge className={`text-xs ${getSentimentColor(item.sentiment)}`}>
                        {formatPercentage(item.sentiment)}%
                      </Badge>
                    )}
                  </div>
                  <span className="text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {recentFeedback.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">No feedback yet</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/ingest">
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="text-blue-600 mb-2">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">Add Feedback</h3>
                <p className="text-sm text-gray-600">Record customer insights</p>
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

      {/* Getting Started Tips */}
      {totalFeedback < 5 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-900 mb-2">🎯 Getting Started Tips</h3>
            <p className="text-green-700 mb-4">
              Add more feedback to unlock powerful insights and AI-powered analysis.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center">
                <span className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center mr-2 text-green-700 font-bold">
                  {Math.min(totalFeedback, 5)}
                </span>
                <span className="text-green-700">of 5 feedback items</span>
              </div>
              <div className="text-green-600">
                {totalFeedback >= 3 ? '✅ AI Analysis Unlocked' : '🔒 AI Analysis (3+ items)'}
              </div>
              <div className="text-green-600">
                {totalFeedback >= 5 ? '✅ Clustering Unlocked' : '🔒 Clustering (5+ items)'}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
} 