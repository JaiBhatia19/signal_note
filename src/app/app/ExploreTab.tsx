'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client';
import Button from '@/components/Button'

interface AnalysisResult {
  id: string
  text: string
  source: string
  created_at: string
  sentiment_number: number
  urgency_text: string
  theme_text: string
  action_text: string
}

interface ExploreTabProps {
  user: any
}

export default function ExploreTab({ user }: ExploreTabProps) {
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [filteredResults, setFilteredResults] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filters
  const [themeFilter, setThemeFilter] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')
  const [sentimentRange, setSentimentRange] = useState([0, 100])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadResults()
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [results, themeFilter, urgencyFilter, sentimentRange, searchQuery])

  const loadResults = async () => {
    try {
      const { data, error } = await supabaseBrowser()
        .from('analyses')
        .select(`
          id,
          sentiment_number,
          urgency_text,
          theme_text,
          action_text,
          created_at,
          feedback_items!inner(
            text,
            source,
            created_at
          )
        `)
        .eq('feedback_items.user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedResults: AnalysisResult[] = data.map((item: any) => ({
        id: item.id,
        text: item.feedback_items.text,
        source: item.feedback_items.source || 'unknown',
        created_at: item.feedback_items.created_at,
        sentiment_number: item.sentiment_number,
        urgency_text: item.urgency_text,
        theme_text: item.theme_text,
        action_text: item.action_text
      }))

      setResults(formattedResults)
    } catch (err: any) {
      setError(err.message || 'Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...results]

    // Theme filter
    if (themeFilter) {
      filtered = filtered.filter(item => 
        item.theme_text.toLowerCase().includes(themeFilter.toLowerCase())
      )
    }

    // Urgency filter
    if (urgencyFilter) {
      filtered = filtered.filter(item => item.urgency_text === urgencyFilter)
    }

    // Sentiment range filter
    filtered = filtered.filter(item => 
      item.sentiment_number >= sentimentRange[0] && 
      item.sentiment_number <= sentimentRange[1]
    )

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.theme_text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredResults(filtered)
  }

  const exportToCSV = () => {
    const headers = ['Text', 'Source', 'Theme', 'Urgency', 'Sentiment', 'Action', 'Date']
    const csvContent = [
      headers.join(','),
      ...filteredResults.map(item => [
        `"${item.text.replace(/"/g, '""')}"`,
        `"${item.source}"`,
        `"${item.theme_text}"`,
        `"${item.urgency_text}"`,
        item.sentiment_number,
        `"${item.action_text}"`,
        `"${new Date(item.created_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `feedback-analysis-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 70) return 'text-green-600'
    if (sentiment >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {error}</div>
          <Button onClick={loadResults} className="mt-2 bg-red-600 hover:bg-red-700 text-white">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Explore Results</h2>
          <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700 text-white">
            Export to CSV
          </Button>
        </div>
        <p className="text-gray-600">
          Browse and filter your analyzed feedback. Use the filters below to find specific insights.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
          <input
            type="text"
            value={themeFilter}
            onChange={(e) => setThemeFilter(e.target.value)}
            placeholder="Filter by theme..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sentiment Range</label>
          <div className="flex space-x-2">
            <input
              type="number"
              min="0"
              max="100"
              value={sentimentRange[0]}
              onChange={(e) => setSentimentRange([parseInt(e.target.value), sentimentRange[1]])}
              className="w-20 px-2 py-2 border border-gray-300 rounded-md text-center"
            />
            <span className="self-center text-gray-500">to</span>
            <input
              type="number"
              min="0"
              max="100"
              value={sentimentRange[1]}
              onChange={(e) => setSentimentRange([sentimentRange[0], parseInt(e.target.value)])}
              className="w-20 px-2 py-2 border border-gray-300 rounded-md text-center"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search text or themes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">
            Results ({filteredResults.length})
          </h3>
          {filteredResults.length !== results.length && (
            <Button 
              onClick={() => {
                setThemeFilter('')
                setUrgencyFilter('')
                setSentimentRange([0, 100])
                setSearchQuery('')
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {results.length === 0 ? 'No results found. Upload some feedback to get started.' : 'No results match your filters.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-gray-900 mb-2">{item.text}</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {item.theme_text}
                    </span>
                    <span className={`px-2 py-1 rounded ${getUrgencyColor(item.urgency_text)} bg-gray-100`}>
                      {item.urgency_text} urgency
                    </span>
                    <span className={`px-2 py-1 rounded ${getSentimentColor(item.sentiment_number)} bg-gray-100`}>
                      {item.sentiment_number}% sentiment
                    </span>
                    {item.source && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                        {item.source}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 ml-4">
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
              
              {item.action_text && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Action:</span> {item.action_text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 