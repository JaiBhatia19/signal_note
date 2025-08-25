'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client';

interface ThemeSummary {
  theme: string
  count: number
  sample_quotes: string[]
}

interface ThemesTabProps {
  user: any
}

export default function ThemesTab({ user }: ThemesTabProps) {
  const [themes, setThemes] = useState<ThemeSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadThemes()
  }, [user])

  const loadThemes = async () => {
    try {
      const response = await fetch('/api/themes')
      if (!response.ok) {
        throw new Error('Failed to fetch themes')
      }
      
      const data = await response.json()
      setThemes(data.themes || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load themes')
    } finally {
      setLoading(false)
    }
  }

  const handleThemeClick = (theme: string) => {
    // Navigate to explore tab with theme filter
    router.push('/app?tab=explore&theme=' + encodeURIComponent(theme))
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading themes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {error}</div>
          <button onClick={loadThemes} className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (themes.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏷️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No themes yet</h3>
          <p className="text-gray-600">
            Upload some feedback and run analysis to see themes emerge.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Theme Analysis</h2>
        <p className="text-gray-600">
          Discover patterns in your feedback through AI-generated themes. Click on a theme to explore related feedback.
        </p>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleThemeClick(theme.theme)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">{theme.theme}</h3>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {theme.count}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 mb-3">
              {theme.count === 1 ? '1 feedback item' : `${theme.count} feedback items`}
            </div>

            {/* Sample Quotes */}
            {theme.sample_quotes && theme.sample_quotes.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-700 mb-2">Sample quotes:</div>
                {theme.sample_quotes.map((quote, qIndex) => (
                  <div key={qIndex} className="text-xs text-gray-600 mb-1 p-2 bg-gray-50 rounded italic">
                    "{quote.length > 80 ? quote.substring(0, 80) + '...' : quote}"
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 text-xs text-blue-600 hover:text-blue-800">
              Click to explore →
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900 mb-2">
            {themes.length} {themes.length === 1 ? 'Theme' : 'Themes'} Identified
          </div>
          <p className="text-gray-600">
            Total feedback items analyzed: {themes.reduce((sum, theme) => sum + theme.count, 0)}
          </p>
        </div>
      </div>
    </div>
  )
} 