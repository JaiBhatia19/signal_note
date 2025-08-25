'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface ThemeSummary {
  theme: string
  count: number
  example_quotes: string[]
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
      const supabase = createClient()
      
      // Use the database function to get themes summary
      const { data, error } = await supabase
        .rpc('get_themes_summary', { search_user_id: user.id })

      if (error) throw error

      setThemes(data || [])
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
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading themes...</span>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {theme.theme}
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {theme.count} items
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Example quotes:
              </p>
              {theme.example_quotes.map((quote, quoteIndex) => (
                <div
                  key={quoteIndex}
                  className="text-sm text-gray-700 bg-gray-50 p-3 rounded border-l-4 border-blue-200"
                >
                  "{quote.length > 120 ? `${quote.substring(0, 120)}...` : quote}"
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                <span>Click to explore →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{themes.length}</div>
            <div className="text-sm text-gray-600">Total Themes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {themes.reduce((sum, theme) => sum + theme.count, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {themes.length > 0 ? Math.round(themes.reduce((sum, theme) => sum + theme.count, 0) / themes.length) : 0}
            </div>
            <div className="text-sm text-gray-600">Avg Items per Theme</div>
          </div>
        </div>
      </div>
    </div>
  )
} 