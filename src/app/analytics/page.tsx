import { supabaseServer } from '@/lib/supabase/server';
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Link from 'next/link'
import Guard from '@/components/Guard'

export const dynamic = 'force-dynamic'

export default function AnalyticsPage() {
  return (
    <Guard requirePro>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive analysis of your customer feedback with actionable insights and trends.
          </p>
        </div>

        <AnalyticsDashboard />
      </div>
    </Guard>
  )
}

async function AnalyticsDashboard() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get analytics data
  const { data: analytics } = await supabase.rpc('get_feedback_analytics', {
    search_user_id: user.id,
    days_back: 30
  })

  // Get feedback by source
  const { data: sourceData } = await supabase
    .from('feedback')
    .select('source, sentiment, urgency, business_impact')
    .eq('owner_id', user.id)

  // Get feedback by user segment
  const { data: segmentData } = await supabase
    .from('feedback')
    .select('user_segment, sentiment, urgency, business_impact')
    .eq('owner_id', user.id)
    .not('user_segment', 'is', null)

  // Get feedback by product area
  const { data: areaData } = await supabase
    .from('feedback')
    .select('product_area, sentiment, urgency, business_impact')
    .eq('owner_id', user.id)
    .not('product_area', 'is', null)

  // Get recent clusters
  const { data: recentClusters } = await supabase
    .from('clusters')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const analyticsData = analytics?.[0] || {}

  // Process source data
  const sourceStats = sourceData?.reduce((acc: any, item) => {
    if (!acc[item.source]) {
      acc[item.source] = { count: 0, totalSentiment: 0, totalUrgency: 0, business_impacts: {} }
    }
    acc[item.source].count++
    if (item.sentiment) acc[item.source].totalSentiment += item.sentiment
    if (item.urgency) acc[item.source].totalUrgency += item.urgency
    acc[item.source].business_impacts[item.business_impact] = (acc[item.source].business_impacts[item.business_impact] || 0) + 1
    return acc
  }, {})

  // Process segment data
  const segmentStats = segmentData?.reduce((acc: any, item) => {
    if (!acc[item.user_segment]) {
      acc[item.user_segment] = { count: 0, totalSentiment: 0, totalUrgency: 0, business_impacts: {} }
    }
    acc[item.user_segment].count++
    if (item.sentiment) acc[item.user_segment].totalSentiment += item.sentiment
    if (item.urgency) acc[item.user_segment].totalUrgency += item.urgency
    acc[item.user_segment].business_impacts[item.business_impact] = (acc[item.user_segment].business_impacts[item.business_impact] || 0) + 1
    return acc
  }, {})

  // Process area data
  const areaStats = areaData?.reduce((acc: any, item) => {
    if (!acc[item.product_area]) {
      acc[item.product_area] = { count: 0, totalSentiment: 0, totalUrgency: 0, business_impacts: {} }
    }
    acc[item.product_area].count++
    if (item.sentiment) acc[item.product_area].totalSentiment += item.sentiment
    if (item.urgency) acc[item.product_area].totalUrgency += item.urgency
    acc[item.product_area].business_impacts[item.business_impact] = (acc[item.product_area].business_impacts[item.business_impact] || 0) + 1
    return acc
  }, {})

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
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{analyticsData.total_feedback || 0}</div>
            <div className="text-gray-600">Total Feedback</div>
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
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{recentClusters?.length || 0}</div>
            <div className="text-gray-600">Active Clusters</div>
          </div>
        </Card>
      </div>

      {/* Source Analysis */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback by Source</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sourceStats && Object.entries(sourceStats).map(([source, stats]: [string, any]) => (
            <div key={source} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{source}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Count:</span>
                  <span className="font-medium">{stats.count}</span>
                </div>
                {stats.totalSentiment > 0 && (
                  <div className="flex justify-between">
                    <span>Avg Sentiment:</span>
                    <span className={`font-medium ${getSentimentColor(stats.totalSentiment / stats.count)}`}>
                      {((stats.totalSentiment / stats.count) * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                {stats.totalUrgency > 0 && (
                  <div className="flex justify-between">
                    <span>Avg Urgency:</span>
                    <span className={`font-medium ${getUrgencyColor(stats.totalUrgency / stats.count)}`}>
                      {((stats.totalUrgency / stats.count) * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(stats.business_impacts).map(([impact, count]: [string, any]) => (
                    <Badge key={impact} className={`text-xs ${getPriorityColor(impact)}`}>
                      Impact {impact}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* User Segment Analysis */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback by User Segment</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segmentStats && Object.entries(segmentStats).map(([segment, stats]: [string, any]) => (
            <div key={segment} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{segment}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Count:</span>
                  <span className="font-medium">{stats.count}</span>
                </div>
                {stats.totalSentiment > 0 && (
                  <div className="flex justify-between">
                    <span>Avg Sentiment:</span>
                    <span className={`font-medium ${getSentimentColor(stats.totalSentiment / stats.count)}`}>
                      {((stats.totalSentiment / stats.count) * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                {stats.totalUrgency > 0 && (
                  <div className="flex justify-between">
                    <span>Avg Urgency:</span>
                    <span className={`font-medium ${getUrgencyColor(stats.totalUrgency / stats.count)}`}>
                      {((stats.totalUrgency / stats.count) * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(stats.business_impacts).map(([impact, count]: [string, any]) => (
                    <Badge key={impact} className={`text-xs ${getPriorityColor(impact)}`}>
                      Impact {impact}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Product Area Analysis */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback by Product Area</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areaStats && Object.entries(areaStats).map(([area, stats]: [string, any]) => (
            <div key={area} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{area}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Count:</span>
                  <span className="font-medium">{stats.count}</span>
                </div>
                {stats.totalSentiment > 0 && (
                  <div className="flex justify-between">
                    <span>Avg Sentiment:</span>
                    <span className={`font-medium ${getSentimentColor(stats.totalSentiment / stats.count)}`}>
                      {((stats.totalSentiment / stats.count) * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                {stats.totalUrgency > 0 && (
                  <div className="flex justify-between">
                    <span>Avg Urgency:</span>
                    <span className={`font-medium ${getUrgencyColor(stats.totalUrgency / stats.count)}`}>
                      {((stats.totalUrgency / stats.count) * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(stats.business_impacts).map(([impact, count]: [string, any]) => (
                    <Badge key={impact} className={`text-xs ${getPriorityColor(impact)}`}>
                      Impact {impact}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Clusters */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Feedback Clusters</h3>
          <Link href="/insights" className="text-blue-600 hover:text-blue-700 text-sm">
            Generate More →
          </Link>
        </div>
        <div className="space-y-3">
          {recentClusters && recentClusters.length > 0 ? (
            recentClusters.map((cluster: any) => (
              <div key={cluster.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{cluster.label}</h4>
                  <p className="text-sm text-gray-600">{cluster.feature_request}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="default">{cluster.size} items</Badge>
                    <span className={`text-xs px-2 py-1 rounded-full ${getSentimentColor(cluster.avg_sentiment)}`}>
                      {Math.round(cluster.avg_sentiment * 100)}%
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(cluster.avg_urgency)}`}>
                      {Math.round(cluster.avg_urgency * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No clusters yet. Use the Insights page to generate clusters.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Action Items */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📊 Generate Strategic Insights</h4>
            <p className="text-blue-700 text-sm mb-3">
              Use AI-powered clustering to identify patterns and create actionable feature requests.
            </p>
            <Link href="/insights">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                Generate Clusters
              </button>
            </Link>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">🔍 Deep Dive Analysis</h4>
            <p className="text-green-700 text-sm mb-3">
              Use advanced search filters to explore specific user segments or product areas.
            </p>
            <Link href="/search">
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm">
                Advanced Search
              </button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
} 