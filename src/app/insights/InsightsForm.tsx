'use client'

import { useState } from 'react'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Badge from '@/components/Badge'

interface Cluster {
  title: string
  ids: string[]
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
          description: `Auto-generated from feedback cluster with ${cluster.ids.length} items`
        })
      })

      if (response.ok) {
        alert('Feature request created successfully!')
      }
    } catch (err) {
      console.error('Failed to create feature request:', err)
    }
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
            {loading ? 'Generating Clusters...' : 'Generate Clusters'}
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            This will analyze your recent feedback and group similar items together.
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
            Found {clusters.length} clusters
          </h2>
          {clusters.map((cluster, index) => (
            <Card key={index}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {cluster.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">
                      {cluster.ids.length} feedback items
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => createFeatureRequest(cluster)}
                >
                  Create Feature Request
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && clusters.length === 0 && (
        <Card>
          <div className="text-center text-gray-500 py-8">
            Click "Generate Clusters" to analyze your feedback and discover patterns.
          </div>
        </Card>
      )}
    </>
  )
} 