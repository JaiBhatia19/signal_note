'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Badge from '@/components/Badge';

interface SearchResult {
  id: number;
  text: string;
  source: string | null;
  user_segment: string | null;
  product_area: string | null;
  sentiment: number | null;
  urgency: number | null;
  business_impact: number | null;
  created_at: string;
  similarity: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    source: '',
    user_segment: '',
    product_area: '',
    date_from: '',
    date_to: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        ...filters,
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
      } else {
        console.error('Search error:', data.error);
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      source: '',
      user_segment: '',
      product_area: '',
      date_from: '',
      date_to: '',
    });
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUrgencyColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600';
    if (score >= 0.5) return 'text-orange-600';
    return 'text-green-600';
  };

  const formatPercentage = (score: number) => {
    return Math.round(score * 100);
  };

  const formatSimilarity = (similarity: number) => {
    return Math.round(similarity * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Search Feedback
          </h1>
          <p className="text-xl text-gray-600">
            Find relevant insights using natural language queries and advanced filters.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="max-w-4xl mx-auto mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search your feedback"
                className="w-full text-lg"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="px-8"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Filters Toggle */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
              </svg>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {Object.values(filters).some(Boolean) && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <Input
                    value={filters.source}
                    onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                    placeholder="Email, Survey..."
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Segment</label>
                  <Input
                    value={filters.user_segment}
                    onChange={(e) => setFilters({ ...filters, user_segment: e.target.value })}
                    placeholder="Enterprise, SMB..."
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Area</label>
                  <Input
                    value={filters.product_area}
                    onChange={(e) => setFilters({ ...filters, product_area: e.target.value })}
                    placeholder="UI, API, Mobile..."
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <Input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <Input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="search-results mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Search Results ({results.length})
              </h2>
              <div className="text-sm text-gray-600">
                Query: "{query}"
              </div>
            </div>

            <div className="space-y-4">
              {results.map((result) => (
                <Card key={result.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {formatSimilarity(result.similarity)}% match
                      </Badge>
                      {result.source && (
                        <Badge variant="default" className="text-xs">
                          {result.source}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(result.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {result.text}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      {result.sentiment && (
                        <span className={`${getSentimentColor(result.sentiment)}`}>
                          Sentiment: {formatPercentage(result.sentiment)}%
                        </span>
                      )}
                      {result.urgency && (
                        <span className={`${getUrgencyColor(result.urgency)}`}>
                          Urgency: {formatPercentage(result.urgency)}%
                        </span>
                      )}
                      {result.business_impact && (
                        <span className="text-purple-600">
                          Impact: {result.business_impact}/5
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {result.user_segment && (
                        <Badge variant="outline" className="text-xs">
                          {result.user_segment}
                        </Badge>
                      )}
                      {result.product_area && (
                        <Badge variant="outline" className="text-xs">
                          {result.product_area}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {query && results.length === 0 && !isSearching && (
          <Card className="no-results text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No feedback found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <div className="space-y-3">
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
              <Link href="/ingest">
                <Button>
                  Add More Feedback
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Search Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Search Tips</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Natural Language</h4>
                <p>Try searching for specific features, bugs, or user segments</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Specific Terms</h4>
                <p>Use phrases like "user interface issues" or "mobile app problems"</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Combine Filters</h4>
                <p>Use source, user segment, and date filters for precise results</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 