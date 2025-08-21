'use client'

import { useState } from 'react'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Badge from '@/components/Badge'

interface Cluster {
  title: string
  description: string
  theme: string
  sentiment_trend: string
  urgency_level: string
  affected_segments: string[]
  affected_areas: string[]
  business_impact: string
  priority: number
  ids: string[]
  feedback_count: number
}

export default function InsightsForm() {
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateClusters = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/insights/cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate clusters')
      }

      const data = await response.json()
      setClusters(data.clusters || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createFeatureRequest = async (cluster: Cluster) => {
    try {
      const response = await fetch('/api/feature-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cluster.title,
          description: cluster.description,
          impact_score: cluster.priority === 1 ? 9 : cluster.priority === 2 ? 7 : cluster.priority === 3 ? 5 : cluster.priority === 4 ? 3 : 1,
          effort_score: cluster.urgency_level === 'critical' ? 3 : cluster.urgency_level === 'high' ? 5 : cluster.urgency_level === 'medium' ? 7 : 9,
          affected_users: cluster.affected_segments.join(', '),
          business_value: `High business impact: ${cluster.business_impact}. Affects ${cluster.feedback_count} feedback items.`
        })
      })

      if (response.ok) {
        alert('Feature request created successfully!')
      }
    } catch (err) {
      console.error('Failed to create feature request:', err)
    }
  }

  const getSentimentColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-100'
      case 'negative': return 'text-red-600 bg-red-100'
      case 'mixed': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getUrgencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'text-purple-600 bg-purple-100'
      case 'medium': return 'text-blue-600 bg-blue-100'
      case 'low': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'text-red-600 bg-red-100'
    if (priority <= 3) return 'text-orange-600 bg-orange-100'
    return 'text-green-600 bg-green-100'
  }

  return (
    <>
      <Card className="mb-6">
        <div className="text-center">
          <Button
            onClick={generateClusters}
            disabled={loading}
            size="lg"
          >
            {loading ? 'Generating Clusters...' : 'Generate AI-Powered Clusters'}
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            This will analyze your recent feedback and group similar items together with strategic insights.
          </p>
        </div>
      </Card>

      {error && (
        <Card>
          <div className="text-red-600 text-center">
            {error}
          </div>
        </Card>
      )}

      {clusters.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Found {clusters.length} strategic clusters
          </h2>
          {clusters.map((cluster, index) => (
            <Card key={index}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {cluster.title}
                      </h3>
                      <Badge className={`text-xs px-2 py-1 ${getPriorityColor(cluster.priority)}`}>
                        Priority {cluster.priority}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{cluster.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Analysis</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Theme:</span>
                            <Badge variant="default" className="text-xs">{cluster.theme}</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Sentiment:</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getSentimentColor(cluster.sentiment_trend)}`}>
                              {cluster.sentiment_trend}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Urgency:</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(cluster.urgency_level)}`}>
                              {cluster.urgency_level}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Impact:</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(cluster.business_impact)}`}>
                              {cluster.business_impact}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Scope</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-gray-500">Affected Segments:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {cluster.affected_segments.length > 0 ? (
                                cluster.affected_segments.map((segment, idx) => (
                                  <Badge key={idx} variant="default" className="text-xs">
                                    {segment}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400">Not specified</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Product Areas:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {cluster.affected_areas.length > 0 ? (
                                cluster.affected_areas.map((area, idx) => (
                                  <Badge key={idx} variant="default" className="text-xs">
                                    {area}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400">Not specified</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {cluster.feedback_count} feedback items in this cluster
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => createFeatureRequest(cluster)}
                      >
                        Create Feature Request
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && clusters.length === 0 && (
        <Card>
          <div className="text-center text-gray-500 py-8">
            Click "Generate AI-Powered Clusters" to analyze your feedback and discover strategic patterns.
          </div>
        </Card>
      )}
    </>
  )
} 