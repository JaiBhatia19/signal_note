'use client'

import { useState, useEffect, useRef } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Textarea from '@/components/Textarea'

interface FeedbackItem {
  id: string
  text: string
  sentiment: number
  urgency: 'low' | 'medium' | 'high'
  themes: string[]
  actions: string[]
  source: string
  timestamp: string
  language?: string
  emotion?: string
}

interface AnalysisResult {
  sentiment: number
  urgency: 'low' | 'medium' | 'high'
  themes: string[]
  actions: string[]
  language: string
  emotion: string
  confidence: number
}

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'live' | 'upload' | 'trends'>('live')
  const [feedbackText, setFeedbackText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([])
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [stats, setStats] = useState({
    totalFeedback: 0,
    avgSentiment: 0,
    highUrgency: 0,
    topThemes: [] as string[]
  })

  // Sample data for impressive demo
  const sampleFeedback = [
    "This app is absolutely amazing! The interface is so intuitive and the features are exactly what I needed. Can't believe how fast it processes everything.",
    "I'm having trouble with the upload feature. It keeps crashing when I try to upload large files. This is really frustrating and I need this fixed ASAP.",
    "The new dark mode is perfect for working late at night. Much easier on the eyes and the contrast is excellent. Great job on this update!",
    "The search function is too slow and doesn't find what I'm looking for. It's really annoying when I'm trying to work quickly.",
    "Love the new dashboard! The charts are beautiful and the data visualization is top-notch. This makes reporting so much easier."
  ]

  // Initialize with sample data for impressive demo
  useEffect(() => {
    const initializeDemo = async () => {
      const demoItems: FeedbackItem[] = sampleFeedback.map((text, index) => ({
        id: `demo-${index}`,
        text,
        sentiment: Math.floor(Math.random() * 40) + 60, // 60-100 for demo
        urgency: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        themes: [['User Interface', 'Performance', 'Features', 'User Experience'][Math.floor(Math.random() * 4)]],
        actions: ['Improve search speed', 'Add more themes', 'Optimize performance'],
        source: ['web', 'mobile', 'email'][Math.floor(Math.random() * 3)],
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        language: 'en',
        emotion: ['excited', 'frustrated', 'satisfied', 'annoyed'][Math.floor(Math.random() * 4)]
      }))
      
      setFeedbackList(demoItems)
      updateStats(demoItems)
    }
    
    initializeDemo()
  }, [])

  const updateStats = (items: FeedbackItem[]) => {
    const total = items.length
    const avgSentiment = items.reduce((sum, item) => sum + item.sentiment, 0) / total
    const highUrgency = items.filter(item => item.urgency === 'high').length
    const themeCounts: { [key: string]: number } = {}
    items.forEach(item => {
      item.themes.forEach(theme => {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1
      })
    })
    const topThemes = Object.entries(themeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([theme]) => theme)
    
    setStats({ totalFeedback: total, avgSentiment: Math.round(avgSentiment), highUrgency, topThemes })
  }

  // Simulate AI analysis (in real app, this would call OpenAI)
  const analyzeFeedback = async (text: string): Promise<AnalysisResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simple sentiment analysis based on keywords
    const positiveWords = ['amazing', 'great', 'love', 'perfect', 'excellent', 'awesome', 'good', 'wonderful']
    const negativeWords = ['terrible', 'awful', 'hate', 'bad', 'poor', 'frustrating', 'annoying', 'slow', 'crash']
    const urgentWords = ['asap', 'urgent', 'critical', 'broken', 'crash', 'error', 'fail', 'immediate']
    
    const lowerText = text.toLowerCase()
    let sentiment = 50 // neutral baseline
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) sentiment += 10
    })
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) sentiment -= 15
    })
    
    sentiment = Math.max(0, Math.min(100, sentiment))
    
    let urgency: 'low' | 'medium' | 'high' = 'low'
    if (urgentWords.some(word => lowerText.includes(word))) urgency = 'high'
    else if (negativeWords.some(word => lowerText.includes(word))) urgency = 'medium'
    
    const themes = []
    if (lowerText.includes('interface') || lowerText.includes('ui') || lowerText.includes('design')) themes.push('User Interface')
    if (lowerText.includes('speed') || lowerText.includes('slow') || lowerText.includes('performance')) themes.push('Performance')
    if (lowerText.includes('feature') || lowerText.includes('function')) themes.push('Features')
    if (lowerText.includes('experience') || lowerText.includes('ux')) themes.push('User Experience')
    if (themes.length === 0) themes.push('General Feedback')
    
    const actions = []
    if (lowerText.includes('slow')) actions.push('Optimize performance')
    if (lowerText.includes('crash') || lowerText.includes('error')) actions.push('Fix stability issues')
    if (lowerText.includes('interface') || lowerText.includes('design')) actions.push('Improve UI/UX')
    if (lowerText.includes('feature')) actions.push('Add requested features')
    
    return {
      sentiment,
      urgency,
      themes,
      actions,
      language: 'en',
      emotion: sentiment > 70 ? 'excited' : sentiment < 30 ? 'frustrated' : 'neutral',
      confidence: 0.85
    }
  }

  const handleLiveAnalysis = async () => {
    if (!feedbackText.trim()) return
    
    setIsAnalyzing(true)
    try {
      const analysis = await analyzeFeedback(feedbackText)
      setCurrentAnalysis(analysis)
      
      // Add to feedback list
      const newItem: FeedbackItem = {
        id: `live-${Date.now()}`,
        text: feedbackText,
        ...analysis,
        source: 'live',
        timestamp: new Date().toISOString()
      }
      
      setFeedbackList(prev => [newItem, ...prev])
      updateStats([newItem, ...feedbackList])
      setFeedbackText('')
      setCurrentAnalysis(null)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsProcessingFile(true)
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      const newItems: FeedbackItem[] = []
      for (const line of lines.slice(0, 5)) { // Limit to 5 items for demo
        const analysis = await analyzeFeedback(line)
        newItems.push({
          id: `file-${Date.now()}-${Math.random()}`,
          text: line,
          ...analysis,
          source: 'file',
          timestamp: new Date().toISOString()
        })
      }
      
      setFeedbackList(prev => [...newItems, ...prev])
      updateStats([...newItems, ...feedbackList])
      setUploadedFile(null)
    } catch (error) {
      console.error('File processing failed:', error)
    } finally {
      setIsProcessingFile(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []
      
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        // In real app, send to speech-to-text API
        const mockText = "This is a voice feedback demo. The app should be able to transcribe and analyze voice input in real-time."
        setFeedbackText(mockText)
        setAudioChunks([])
      }
      
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error('Recording failed:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 70) return 'text-green-600'
    if (sentiment >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 SignalNote v1 - AI Feedback Analysis Demo
          </h1>
          <p className="text-xl text-gray-600">
            Experience real-time AI analysis, interactive insights, and professional-grade feedback processing
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalFeedback}</div>
            <div className="text-gray-600">Total Feedback</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.avgSentiment}</div>
            <div className="text-gray-600">Avg Sentiment</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-red-600 mb-2">{stats.highUrgency}</div>
            <div className="text-gray-600">High Priority</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.topThemes.length}</div>
            <div className="text-gray-600">Key Themes</div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'live', label: '🎯 Live Analysis', icon: '⚡' },
              { id: 'upload', label: '📁 File Upload', icon: '📊' },
              { id: 'trends', label: '📈 Insights Dashboard', icon: '🎨' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Live Analysis Tab */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  ⚡ Real-Time AI Analysis
                </h2>
                <p className="text-gray-600 mb-6">
                  Type feedback and watch AI analyze it instantly. No waiting, no delays.
                </p>
              </div>

              {/* Input Methods */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {/* Text Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">💬 Text Input</label>
                  <Textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Type your feedback here..."
                    className="h-32"
                  />
                  <Button
                    onClick={handleLiveAnalysis}
                    disabled={!feedbackText.trim() || isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? '🤖 Analyzing...' : '🚀 Analyze Now'}
                  </Button>
                </div>

                {/* Voice Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">🎤 Voice Input</label>
                  <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    {!isRecording ? (
                      <Button
                        onClick={startRecording}
                        variant="outline"
                        className="w-full h-full"
                      >
                        🎤 Start Recording
                      </Button>
                    ) : (
                      <Button
                        onClick={stopRecording}
                        className="w-full h-full bg-red-600 hover:bg-red-700"
                      >
                        ⏹️ Stop Recording
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {isRecording ? 'Recording... Speak now!' : 'Click to record voice feedback'}
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">📁 File Upload</label>
                  <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setUploadedFile(file)
                          handleFileUpload(file)
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" className="w-full h-full">
                        📁 Choose File
                      </Button>
                    </label>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {uploadedFile ? `Processing: ${uploadedFile.name}` : 'Upload CSV or text files'}
                  </div>
                </div>
              </div>

              {/* Current Analysis Result */}
              {currentAnalysis && (
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">🎯 Live Analysis Result</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Sentiment Score:</span>
                        <span className={`text-2xl font-bold ${getSentimentColor(currentAnalysis.sentiment)}`}>
                          {currentAnalysis.sentiment}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            currentAnalysis.sentiment >= 70 ? 'bg-green-600' :
                            currentAnalysis.sentiment >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${currentAnalysis.sentiment}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2">
                        <span className="font-medium">Urgency:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(currentAnalysis.urgency)}`}>
                          {currentAnalysis.urgency.toUpperCase()}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Language:</span>
                        <span className="ml-2 text-gray-600">{currentAnalysis.language.toUpperCase()}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Emotion:</span>
                        <span className="ml-2 text-gray-600 capitalize">{currentAnalysis.emotion}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-2">
                      <span className="font-medium">Themes:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {currentAnalysis.themes.map((theme, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Recommended Actions:</span>
                      <ul className="list-disc list-inside mt-1 text-sm text-gray-700">
                        {currentAnalysis.actions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* File Upload Tab */}
          {activeTab === 'upload' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📁 Batch File Processing
              </h2>
              <p className="text-gray-600 mb-6">
                Upload CSV files with multiple feedback entries for bulk analysis
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="hidden"
                  id="bulk-upload"
                />
                <label htmlFor="bulk-upload" className="cursor-pointer">
                  <div className="text-6xl mb-4">📁</div>
                  <div className="text-xl font-medium text-gray-900 mb-2">
                    {isProcessingFile ? 'Processing...' : 'Drop your CSV file here'}
                  </div>
                  <div className="text-gray-600 mb-4">
                    or click to browse
                  </div>
                  <Button variant="outline" size="lg">
                    Choose File
                  </Button>
                </label>
              </div>
            </div>
          )}

          {/* Insights Dashboard Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                📈 AI Insights Dashboard
              </h2>
              
              {/* Sentiment Distribution */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Positive (70-100)</span>
                      <span className="text-sm font-medium text-green-600">
                        {feedbackList.filter(f => f.sentiment >= 70).length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(feedbackList.filter(f => f.sentiment >= 70).length / Math.max(feedbackList.length, 1)) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Neutral (40-69)</span>
                      <span className="text-sm font-medium text-yellow-600">
                        {feedbackList.filter(f => f.sentiment >= 40 && f.sentiment < 70).length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: `${(feedbackList.filter(f => f.sentiment >= 40 && f.sentiment < 70).length / Math.max(feedbackList.length, 1)) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Negative (0-39)</span>
                      <span className="text-sm font-medium text-red-600">
                        {feedbackList.filter(f => f.sentiment < 40).length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${(feedbackList.filter(f => f.sentiment < 40).length / Math.max(feedbackList.length, 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Urgency Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">High Priority</span>
                      <span className="text-sm font-medium text-red-600">
                        {feedbackList.filter(f => f.urgency === 'high').length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${(feedbackList.filter(f => f.urgency === 'high').length / Math.max(feedbackList.length, 1)) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Medium Priority</span>
                      <span className="text-sm font-medium text-yellow-600">
                        {feedbackList.filter(f => f.urgency === 'medium').length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: `${(feedbackList.filter(f => f.urgency === 'medium').length / Math.max(feedbackList.length, 1)) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Low Priority</span>
                      <span className="text-sm font-medium text-green-600">
                        {feedbackList.filter(f => f.urgency === 'low').length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(feedbackList.filter(f => f.urgency === 'low').length / Math.max(feedbackList.length, 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Top Themes */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 Trending Themes</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {stats.topThemes.map((theme, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{theme}</span>
                      <span className="text-sm text-gray-600">
                        {feedbackList.filter(f => f.themes.includes(theme)).length} mentions
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Feedback List */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📝 Recent Feedback Analysis</h2>
          <div className="space-y-4">
            {feedbackList.slice(0, 10).map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 mb-3">{item.text}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Sentiment:</span>
                        <span className={`font-bold ${getSentimentColor(item.sentiment)}`}>
                          {item.sentiment}/100
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Urgency:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(item.urgency)}`}>
                          {item.urgency.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Source:</span>
                        <span className="text-gray-600 capitalize">{item.source}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Time:</span>
                        <span className="text-gray-600">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium text-sm">Themes:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.themes.map((theme, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Export Section */}
        <div className="mt-8 text-center">
          <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🚀 Ready to Export Your Insights?
            </h3>
            <p className="text-gray-600 mb-6">
              Download your analyzed feedback as CSV for presentations, reports, and team collaboration.
            </p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              📊 Export to CSV
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
} 