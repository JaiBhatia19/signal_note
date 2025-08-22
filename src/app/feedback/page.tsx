'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import Input from '@/components/Input';

interface FeedbackItem {
  id: number;
  text: string;
  source: string | null;
  user_segment: string | null;
  product_area: string | null;
  sentiment: number | null;
  urgency: number | null;
  business_impact: number | null;
  created_at: string;
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    source: '',
    user_segment: '',
    product_area: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/feedback');
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || []);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFeedback = feedback.filter(item => {
    if (filters.source && item.source !== filters.source) return false;
    if (filters.user_segment && item.user_segment !== filters.user_segment) return false;
    if (filters.product_area && item.product_area !== filters.product_area) return false;
    return true;
  });

  const clearFilters = () => {
    setFilters({
      source: '',
      user_segment: '',
      product_area: '',
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

  const getUniqueValues = (field: keyof FeedbackItem) => {
    const values = feedback.map(item => item[field]).filter((value): value is string => typeof value === 'string');
    return Array.from(new Set(values));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            All Feedback
          </h1>
          <p className="text-xl text-gray-600">
            View and manage all your customer feedback in one place.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
              </svg>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            {Object.values(filters).some(Boolean) && (
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear Filters
              </Button>
            )}
          </div>

          <Link href="/ingest">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Feedback
            </Button>
          </Link>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <select
                  value={filters.source}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">All Sources</option>
                  {getUniqueValues('source').map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Segment</label>
                <select
                  value={filters.user_segment}
                  onChange={(e) => setFilters({ ...filters, user_segment: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">All Segments</option>
                  {getUniqueValues('user_segment').map((segment) => (
                    <option key={segment} value={segment}>
                      {segment}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Area</label>
                <select
                  value={filters.product_area}
                  onChange={(e) => setFilters({ ...filters, product_area: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">All Areas</option>
                  {getUniqueValues('product_area').map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Feedback List */}
        {filteredFeedback.length > 0 ? (
          <div className="space-y-4 mb-8">
            {filteredFeedback.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {item.source && (
                      <Badge variant="default" className="text-xs">
                        {item.source}
                      </Badge>
                    )}
                    {item.sentiment && (
                      <Badge className={`text-xs ${getSentimentColor(item.sentiment)}`}>
                        Sentiment: {formatPercentage(item.sentiment)}%
                      </Badge>
                    )}
                    {item.urgency && (
                      <Badge className={`text-xs ${getUrgencyColor(item.urgency)}`}>
                        Urgency: {formatPercentage(item.urgency)}%
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  {item.text}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.user_segment && (
                      <Badge variant="outline" className="text-xs">
                        {item.user_segment}
                      </Badge>
                    )}
                    {item.product_area && (
                      <Badge variant="outline" className="text-xs">
                        {item.product_area}
                      </Badge>
                    )}
                    {item.business_impact && (
                      <Badge variant="outline" className="text-xs">
                        Impact: {item.business_impact}/5
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/feedback/${item.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="text-center py-12 mb-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {Object.values(filters).some(Boolean) ? 'No feedback matches filters' : 'No feedback yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some(Boolean) 
                ? 'Try adjusting your filters or add more feedback.'
                : 'Start collecting customer feedback to see it here.'
              }
            </p>
            <div className="space-y-3">
              {Object.values(filters).some(Boolean) && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
              <Link href="/ingest">
                <Button>
                  Add Feedback
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Stats */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Feedback Summary</h3>
            <div className="grid md:grid-cols-4 gap-6 text-sm text-blue-800">
              <div>
                <div className="text-2xl font-bold text-blue-900">{feedback.length}</div>
                <div>Total Feedback</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {feedback.filter(f => f.sentiment).length}
                </div>
                <div>Analyzed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {getUniqueValues('source').length}
                </div>
                <div>Sources</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {getUniqueValues('user_segment').length}
                </div>
                <div>User Segments</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <Link href="/dashboard">
            <Button variant="outline">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 