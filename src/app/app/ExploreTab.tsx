'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Button from '@/components/Button'

interface AnalysisResult {
  id: number
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
      const supabase = createClient()
      const { data, error } = await supabase
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

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.theme_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.action_text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredResults(filtered)
  }

  const exportCSV = () => {
    if (filteredResults.length === 0) return

    const csvContent = [
      'Text,Source,Created At,Sentiment,Urgency,Theme,Action',
      ...filteredResults.map(item => 
        `"${item.text.replace(/"/g, '""')}","${item.source}","${item.created_at}",${item.sentiment_number},"${item.urgency_text}","${item.theme_text}","${item.action_text.replace(/"/g, '""')}"`
      )
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
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading results...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Explore Results</h2>
          <Button
            onClick={exportCSV}
            disabled={filteredResults.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Export CSV ({filteredResults.length})
          </Button>
        </div>
        <p className="text-gray-600">
          View and filter your analyzed feedback. Use the controls below to narrow down results.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search text, themes, actions..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
          <select
            value={themeFilter}
            onChange={(e) => setThemeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All themes</option>
            {Array.from(new Set(results.map(r => r.theme_text))).map(theme => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All urgency levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sentiment: {sentimentRange[0]}-{sentimentRange[1]}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={sentimentRange[1]}
            onChange={(e) => setSentimentRange([sentimentRange[0], parseInt(e.target.value)])}
            className="w-full"
          />
          <input
            type="range"
            min="0"
            max="100"
            value={sentimentRange[0]}
            onChange={(e) => setSentimentRange([parseInt(e.target.value), sentimentRange[1]])}
            className="w-full"
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feedback
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sentiment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Urgency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Theme
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredResults.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No results match your filters. Try adjusting the criteria above.
                </td>
              </tr>
            ) : (
              filteredResults.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {item.text.length > 100 ? `${item.text.substring(0, 100)}...` : item.text}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.source}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${getSentimentColor(item.sentiment_number)}`}>
                      {item.sentiment_number}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(item.urgency_text)}`}>
                      {item.urgency_text}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.theme_text}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    {item.action_text}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Results Summary */}
      <div className="mt-6 text-sm text-gray-600">
        Showing {filteredResults.length} of {results.length} total results
      </div>
    </div>
  )
} 