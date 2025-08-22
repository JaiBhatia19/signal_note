'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [feedbackSources, setFeedbackSources] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const supabase = getSupabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        router.push('/login')
      }
    }
    getUser()
  }, [router])

  const availableSources = [
    'Customer Support Tickets',
    'User Interviews',
    'App Store Reviews',
    'Email Feedback',
    'Slack/Teams',
    'Zoom Calls',
    'Surveys',
    'Social Media',
    'User Testing',
    'Analytics Data'
  ]

  const handleSourceToggle = (source: string) => {
    setFeedbackSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    )
  }

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseBrowser()
      
      // Update user profile with onboarding data
              await supabase
          .from('profiles')
          .update({
            name: companyName,
            onboarding_completed: true
          })
          .eq('id', user.id)

      // Create sample feedback data for immediate value
      const sampleFeedback = [
        {
          owner_id: user.id,
          source: 'User Interview',
          text: "The onboarding process is too complicated. Users get confused at step 3 and often abandon the process. We need to simplify this significantly.",
          user_segment: 'New Users',
          product_area: 'Onboarding'
        },
        {
          owner_id: user.id,
          source: 'Support Ticket',
          text: "Love the new dashboard design! Much easier to navigate than before. The charts are clearer and the data visualization is really helpful.",
          user_segment: 'Power Users',
          product_area: 'Dashboard'
        },
        {
          owner_id: user.id,
          source: 'App Store Review',
          text: "Great app but the search function is too slow. It takes 5-10 seconds to return results, which makes it unusable for quick lookups.",
          user_segment: 'Enterprise Users',
          product_area: 'Search'
        },
        {
          owner_id: user.id,
          source: 'Email Feedback',
          text: "The mobile app needs better offline support. When I'm on the train without internet, I can't access my saved documents.",
          user_segment: 'Mobile Users',
          product_area: 'Mobile App'
        }
      ]

      // Insert sample feedback
      for (const feedback of sampleFeedback) {
        await supabase.from('feedback').insert(feedback)
      }



      router.push('/dashboard?onboarding=complete')
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Step {step} of 4
            </div>
            <div className="text-sm text-gray-600">
              {Math.round((step / 4) * 100)}% Complete
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8">
          {step === 1 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to SignalNote! 🎉
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Let's get you set up with the most powerful customer feedback analysis platform. 
                In just a few minutes, you'll have insights that normally take weeks to discover.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">AI Analysis</h3>
                  <p className="text-sm text-gray-600">Instant insights from feedback</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Smart Search</h3>
                  <p className="text-sm text-gray-600">Find feedback instantly</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Auto Clustering</h3>
                  <p className="text-sm text-gray-600">Group similar feedback</p>
                </div>
              </div>
              <Button onClick={handleNext} size="lg" className="px-8">
                Get Started
              </Button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us about your company</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Acme Corp, StartupXYZ"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select your industry</option>
                    <option value="SaaS">SaaS</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Fintech">Fintech</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Size
                  </label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select team size</option>
                    <option value="1-10">1-10 people</option>
                    <option value="11-50">11-50 people</option>
                    <option value="51-200">51-200 people</option>
                    <option value="201-1000">201-1000 people</option>
                    <option value="1000+">1000+ people</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Where do you collect feedback?</h2>
              <p className="text-gray-600 mb-6">
                Select all the sources where you currently collect customer feedback. 
                We'll help you analyze and organize them all in one place.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableSources.map((source) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => handleSourceToggle(source)}
                    className={`p-3 text-left rounded-lg border-2 transition-all ${
                      feedbackSources.includes(source)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{source}</div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Don't worry - you can always add or remove sources later.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                You're all set! 🎯
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                We've created sample data to get you started immediately. 
                You'll see how SignalNote analyzes feedback and generates insights in real-time.
              </p>
              <div className="bg-blue-50 p-6 rounded-lg mb-8">
                <h3 className="font-semibold text-blue-900 mb-3">What we've set up for you:</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    4 sample feedback items
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    2 feature requests
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    AI-powered insights
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Sentiment analysis
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleComplete} 
                size="lg" 
                className="px-8"
                disabled={loading}
              >
                {loading ? 'Setting up...' : 'Go to Dashboard'}
              </Button>
            </div>
          )}

          {/* Navigation */}
          {step > 1 && step < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext}>
                Next
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
} 