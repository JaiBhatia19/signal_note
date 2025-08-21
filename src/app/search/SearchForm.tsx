'use client'

import { useState } from 'react'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Badge from '@/components/Badge'

interface SearchResult {
  id: string
  content: string
  source: string
  user_segment: string
  product_area: string
  priority: string
  sentiment_score: number
  urgency_score: number
  created_at: string
  similarity: number
}

export default function SearchForm() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({
    source: '',
    userSegment: '',
    productArea: '',
    priority: ''
  })
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          q: query.trim(),
          ...filters
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Search failed')
      }

      const data = await response.json()
      setResults(data.results || [])
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
      priority: ''
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
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

  return (
    <>
      <Card className="mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <Input
            placeholder="Search feedback for keywords or themes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          
          {/* Advanced Filters */}
          <div className="grid md:grid-cols-4 gap-3">
            <select
              value={filters.source}
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sources</option>
              <option value="Manual">Manual Entry</option>
              <option value="Zoom">Zoom Transcript</option>
              <option value="Slack">Slack</option>
              <option value="Email">Email</option>
              <option value="Survey">Survey</option>
              <option value="Support">Support Ticket</option>
              <option value="User Interview">User Interview</option>
              <option value="App Store Review">App Store Review</option>
              <option value="Intercom">Intercom</option>
              <option value="Zendesk">Zendesk</option>
              <option value="Hotjar">Hotjar</option>
              <option value="FullStory">FullStory</option>
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

            <Input
              placeholder="User Segment"
              value={filters.userSegment}
              onChange={(e) => setFilters(prev => ({ ...prev, userSegment: e.target.value }))}
              className="w-full"
            />

            <Input
              placeholder="Product Area"
              value={filters.productArea}
              onChange={(e) => setFilters(prev => ({ ...prev, productArea: e.target.value }))}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-3">
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full sm:w-auto"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
            
            {(filters.source || filters.priority || filters.userSegment || filters.productArea) && (
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="w-full sm:w-auto"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </form>
      </Card>

      {error && (
        <Card>
          <div className="text-red-600 text-center">
            {error}
          </div>
        </Card>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Found {results.length} results
          </h2>
          {results.map((result) => (
            <Card key={result.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <Badge variant="default">{result.source}</Badge>
                    {result.user_segment && (
                      <Badge variant="default" className="text-xs">
                        {result.user_segment}
                      </Badge>
                    )}
                    {result.product_area && (
                      <Badge variant="default" className="text-xs">
                        {result.product_area}
                      </Badge>
                    )}
                    <Badge className={`text-xs ${getPriorityColor(result.priority)}`}>
                      {result.priority}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDate(result.created_at)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {(result.similarity * 100).toFixed(1)}% match
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed">
                  {result.content.length > 300 
                    ? `${result.content.substring(0, 300)}...` 
                    : result.content
                  }
                </p>

                {/* AI Analysis Results */}
                {(result.sentiment_score || result.urgency_score) && (
                  <div className="flex items-center space-x-4 text-sm">
                    {result.sentiment_score && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">Sentiment:</span>
                        <span className={`font-medium ${getSentimentColor(result.sentiment_score)}`}>
                          {(result.sentiment_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                    {result.urgency_score && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">Urgency:</span>
                        <span className={`font-medium ${getUrgencyColor(result.urgency_score)}`}>
                          {(result.urgency_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && results.length === 0 && query && (
        <Card>
          <div className="text-center text-gray-500 py-8">
            No results found for "{query}". Try different keywords or adjust your filters.
          </div>
        </Card>
      )}
    </>
  )
} 