'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client';
import { useEffect } from 'react'
import UploadTab from './UploadTab'
import ExploreTab from './ExploreTab'
import ThemesTab from './ThemesTab'
import ErrorBoundary from '@/components/ErrorBoundary'
import Button from '@/components/Button'

type TabType = 'upload' | 'explore' | 'themes'

export default function AppPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upload')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabaseBrowser().auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      setLoading(false)
    }
    checkSession()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const tabs = [
    { id: 'upload', label: 'Upload', icon: '📁' },
    { id: 'explore', label: 'Explore', icon: '🔍' },
    { id: 'themes', label: 'Themes', icon: '🏷️' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">SignalNote v1</h1>
            <Button
              onClick={() => router.push('/demo')}
              variant="outline"
              className="text-sm"
            >
              🚀 Try Demo
            </Button>
          </div>
          <p className="text-gray-600">Upload feedback, analyze with AI, and discover insights</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <ErrorBoundary>
            {activeTab === 'upload' && <UploadTab user={user} />}
            {activeTab === 'explore' && <ExploreTab user={user} />}
            {activeTab === 'themes' && <ThemesTab user={user} />}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
} 