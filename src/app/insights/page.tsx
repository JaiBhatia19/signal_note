'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/Badge';

interface Cluster {
  id: number;
  label: string;
  size: number;
  avg_sentiment: number;
  avg_urgency: number;
  feature_request: string;
  action_items: string;
  created_at: string;
}

export default function InsightsPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [rebuildCount, setRebuildCount] = useState(5);

  useEffect(() => {
    fetchClusters();
  }, []);

  const fetchClusters = async () => {
    try {
      const response = await fetch('/api/insights');
      if (response.ok) {
        const data = await response.json();
        setClusters(data.clusters || []);
      }
    } catch (error) {
      console.error('Error fetching clusters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRebuildClusters = async () => {
    setIsRebuilding(true);
    try {
      const response = await fetch('/api/cluster/rebuild', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ k: rebuildCount }),
      });

      if (response.ok) {
        const data = await response.json();
        setClusters(data.clusters || []);
      } else {
        console.error('Failed to rebuild clusters');
      }
    } catch (error) {
      console.error('Error rebuilding clusters:', error);
    } finally {
      setIsRebuilding(false);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Insights
          </h1>
          <p className="text-xl text-gray-600">
            Discover patterns and actionable insights from your customer feedback.
          </p>
        </div>

        {/* Rebuild Controls */}
        <Card className="mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Rebuild Clusters
              </h2>
              <p className="text-sm text-gray-600">
                Generate new insights by rebuilding your feedback clusters with AI.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="clusterCount" className="text-sm font-medium text-gray-700">
                  Clusters:
                </label>
                <select
                  id="clusterCount"
                  value={rebuildCount}
                  onChange={(e) => setRebuildCount(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={7}>7</option>
                  <option value={10}>10</option>
                </select>
              </div>
              <Button
                onClick={handleRebuildClusters}
                disabled={isRebuilding}
                className="whitespace-nowrap"
              >
                {isRebuilding ? 'Rebuilding...' : 'Rebuild Clusters'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Clusters Grid */}
        {clusters.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {clusters.map((cluster) => (
              <Card key={cluster.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {cluster.label}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="default" className="text-xs">
                        {cluster.size} items
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(cluster.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className={`text-lg font-semibold ${getSentimentColor(cluster.avg_sentiment)}`}>
                      {formatPercentage(cluster.avg_sentiment)}%
                    </div>
                    <div className="text-xs text-gray-600">Sentiment</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className={`text-lg font-semibold ${getUrgencyColor(cluster.avg_urgency)}`}>
                      {formatPercentage(cluster.avg_urgency)}%
                    </div>
                    <div className="text-xs text-gray-600">Urgency</div>
                  </div>
                </div>

                {/* Feature Request */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Suggested Feature</h4>
                  <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                    {cluster.feature_request}
                  </p>
                </div>

                {/* Action Items */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Action Items</h4>
                  <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                    {cluster.action_items}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="text-center py-12 mb-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No insights yet</h3>
            <p className="text-gray-600 mb-6">
              You need at least 5 feedback items to generate AI-powered insights.
            </p>
            <div className="space-y-3">
              <Link href="/ingest">
                <Button>
                  Add Feedback
                </Button>
              </Link>
              <Button
                onClick={handleRebuildClusters}
                disabled={isRebuilding}
                variant="outline"
              >
                {isRebuilding ? 'Rebuilding...' : 'Try Rebuilding'}
              </Button>
            </div>
          </Card>
        )}

        {/* How It Works */}
        <Card className="bg-blue-50 border-blue-200 mb-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">🔍 How AI Insights Work</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Pattern Recognition</h4>
                <p>Our AI analyzes your feedback to identify recurring themes and patterns</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Smart Clustering</h4>
                <p>Similar feedback is grouped together using semantic similarity and k-means clustering</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Actionable Output</h4>
                <p>Each cluster generates a feature request and specific action items for your team</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tips */}
        <Card className="mb-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Tips for Better Insights</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Add More Feedback</h4>
                <p>More data leads to more accurate clustering and better insights</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Experiment with Cluster Count</h4>
                <p>Try different numbers of clusters to find the optimal balance</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Regular Updates</h4>
                <p>Rebuild clusters periodically as you add new feedback</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Review and Act</h4>
                <p>Use the generated insights to prioritize your product roadmap</p>
              </div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
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