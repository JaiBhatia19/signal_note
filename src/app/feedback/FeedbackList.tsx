'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Input from '@/components/Input'

interface FeedbackItem {
  id: string
  content: string
  source: string
  user_segment: string
  product_area: string
  priority: string
  sentiment_score: number
  urgency_score: number
  ai_insights: any
  created_at: string
}

interface FeedbackListProps {
  uniqueSources: string[]
  uniqueSegments: string[]
  uniqueAreas: string[]
}

export default function FeedbackList({ uniqueSources, uniqueSegments, uniqueAreas }: FeedbackListProps) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    source: '',
    userSegment: '',
    productArea: '',
    priority: '',
    search: ''
  })
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchFeedback()
  }, [filters, sortBy, sortOrder])

  const fetchFeedback = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (filters.source) queryParams.append('source', filters.source)
      if (filters.userSegment) queryParams.append('userSegment', filters.userSegment)
      if (filters.productArea) queryParams.append('productArea', filters.productArea)
      if (filters.priority) queryParams.append('priority', filters.priority)
      if (filters.search) queryParams.append('search', filters.search)
      queryParams.append('sortBy', sortBy)
      queryParams.append('sortOrder', sortOrder)

      const response = await fetch(`/api/feedback?${queryParams}`)
      if (!response.ok) throw new Error('Failed to fetch feedback')
      
      const data = await response.json()
      setFeedback(data.feedback || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      source: '',
      userSegment: '',
      productArea: '',
      priority: '',
      search: ''
    })
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString()
  }

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading feedback...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Error loading feedback</div>
          <p className="text-gray-500">{error}</p>
          <Button onClick={fetchFeedback} className="mt-4">
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="Search feedback content..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            
            <select
              value={filters.source}
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sources</option>
              {uniqueSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filters.userSegment}
              onChange={(e) => setFilters(prev => ({ ...prev, userSegment: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All User Segments</option>
              {uniqueSegments.map(segment => (
                <option key={segment} value={segment}>{segment}</option>
              ))}
            </select>

            <select
              value={filters.productArea}
              onChange={(e) => setFilters(prev => ({ ...prev, productArea: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Product Areas</option>
              {uniqueAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created_at">Date</option>
              <option value="priority">Priority</option>
              <option value="sentiment_score">Sentiment</option>
              <option value="urgency_score">Urgency</option>
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {feedback.length} feedback items
        </h3>
        <div className="text-sm text-gray-500">
          Showing filtered results
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedback.length > 0 ? (
          feedback.map((item) => (
            <Card key={item.id}>
              <div className="space-y-4">
                {/* Content */}
                <div>
                  <p className="text-gray-700 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {/* Metadata */}
                <div className="flex items-center space-x-3 flex-wrap">
                  <Badge variant="default">{item.source}</Badge>
                  {item.user_segment && (
                    <Badge variant="default" className="text-xs">
                      {item.user_segment}
                    </Badge>
                  )}
                  {item.product_area && (
                    <Badge variant="default" className="text-xs">
                      {item.product_area}
                    </Badge>
                  )}
                  <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatDate(item.created_at)} at {formatTime(item.created_at)}
                  </span>
                </div>

                {/* AI Analysis Results */}
                {(item.sentiment_score || item.urgency_score || item.ai_insights) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">AI Analysis</h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Scores */}
                      <div className="space-y-2">
                        {item.sentiment_score && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Sentiment:</span>
                            <span className={`text-sm font-medium ${getSentimentColor(item.sentiment_score)}`}>
                              {(item.sentiment_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                        {item.urgency_score && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Urgency:</span>
                            <span className={`text-sm font-medium ${getUrgencyColor(item.urgency_score)}`}>
                              {(item.urgency_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Insights */}
                      {item.ai_insights && (
                        <div>
                          <div className="text-sm text-gray-600 mb-2">Key Insights:</div>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {item.ai_insights.insights?.slice(0, 3).map((insight: string, idx: number) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Action Items */}
                    {item.ai_insights?.action_items && item.ai_insights.action_items.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">Suggested Actions:</div>
                        <div className="flex flex-wrap gap-2">
                          {item.ai_insights.action_items.slice(0, 3).map((action: string, idx: number) => (
                            <Badge key={idx} variant="default" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
              <p className="text-gray-500 mb-4">
                {filters.search || filters.source || filters.userSegment || filters.productArea || filters.priority
                  ? 'Try adjusting your filters or search terms.'
                  : 'Start collecting customer insights to see them here.'
                }
              </p>
              {!filters.search && !filters.source && !filters.userSegment && !filters.productArea && !filters.priority && (
                <a href="/add-feedback" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Add Your First Feedback
                </a>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
} 