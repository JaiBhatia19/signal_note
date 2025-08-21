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
  created_at: string
  similarity: number
}

export default function SearchForm() {
  const [query, setQuery] = useState('')
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
        body: JSON.stringify({ q: query.trim() })
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
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
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full sm:w-auto"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
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
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">{result.source}</Badge>
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
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && results.length === 0 && query && (
        <Card>
          <div className="text-center text-gray-500 py-8">
            No results found for "{query}". Try different keywords or phrases.
          </div>
        </Card>
      )}
    </>
  )
} 