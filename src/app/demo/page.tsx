'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client';
import { useEffect } from 'react'

interface AnalysisResult {
  text: string
  sentiment: number
  urgency: 'low' | 'medium' | 'high'
  theme: string
  action: string
}

export default function DemoPage() {
  const [feedback, setFeedback] = useState('')
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabaseBrowser().auth.getSession()
      if (!session) {
        router.push('/login')
      }
    }
    checkSession()
  }, [router])

  const handleAnalyze = async () => {
    if (!feedback.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      const lines = feedback.trim().split('\n').filter(line => line.trim())
      if (lines.length === 0) return
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines })
      })
      
      if (!response.ok) throw new Error('Analysis failed')
      
      const data = await response.json()
      setResults(data.results)
    } catch (err: any) {
      setError(err.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    if (results.length === 0) return
    
    const csvContent = [
      'Feedback,Sentiment,Urgency,Theme,Action',
      ...results.map(r => `"${r.text}",${r.sentiment},${r.urgency},"${r.theme}","${r.action}"`)
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'feedback-analysis.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback Analysis Demo</h1>
          <p className="text-gray-600">Paste your feedback lines below to get instant analysis</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback Lines (one per line)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter feedback lines here...&#10;Example:&#10;The app is too slow&#10;Great user interface&#10;Need better search"
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleAnalyze}
              disabled={loading || !feedback.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
            
            {results.length > 0 && (
              <button
                onClick={exportCSV}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Analysis Results</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Theme</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 max-w-xs">
                        {result.text}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.sentiment}/100
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          result.urgency === 'high' ? 'bg-red-100 text-red-800' :
                          result.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {result.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.theme}
                      </td>
                      <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 max-w-xs">
                        {result.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/app')}
            className="text-blue-600 hover:text-blue-500"
          >
            ← Back to App
          </button>
        </div>
      </div>
    </div>
  )
} 