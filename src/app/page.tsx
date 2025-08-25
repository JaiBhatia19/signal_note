import Link from 'next/link'
import Card from '@/components/Card'
import Button from '@/components/Button'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl mb-6">
          Turn Customer Feedback Into
          <span className="text-blue-600"> Actionable Insights</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Upload CSV feedback → Get AI-powered analysis → Discover patterns and themes instantly
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/demo">
            <Button size="lg" className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700">
              🚀 Try It Live - No Signup Required
            </Button>
          </Link>
          <a href="https://github.com/JaiBhatia19/signal_note" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              👀 View Code
            </Button>
          </a>
        </div>

        {/* What You Can Do */}
        <div className="bg-blue-50 rounded-lg p-8 mb-16 border border-blue-200">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            🎯 What You Can Do Right Now
          </h3>
          <p className="text-gray-600 mb-6">
            Upload any CSV with customer feedback and see AI analysis in action. No account needed.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <span className="font-semibold">📊 Sentiment Analysis</span><br/>
              Get 0-100 scores for each piece of feedback
            </div>
            <div className="bg-white p-3 rounded-lg">
              <span className="font-semibold">🚨 Urgency Detection</span><br/>
              Identify high-priority issues automatically
            </div>
            <div className="bg-white p-3 rounded-lg">
              <span className="font-semibold">🏷️ Theme Discovery</span><br/>
              Find recurring patterns and insights
            </div>
          </div>
        </div>

        {/* Demo Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Analysis</h3>
            <p className="text-gray-600">AI-powered feedback analysis with semantic understanding</p>
          </Card>
          
          <Card className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Semantic Search</h3>
            <p className="text-gray-600">Find relevant feedback instantly with natural language queries</p>
          </Card>
          
          <Card className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto Clustering</h3>
            <p className="text-gray-600">Automatically group feedback into actionable themes</p>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload CSV</h3>
              <p className="text-gray-600">Upload any CSV file with customer feedback. Just needs a "text" column.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">Our AI automatically analyzes sentiment, urgency, and discovers themes.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Export Insights</h3>
              <p className="text-gray-600">Download your analyzed results as CSV for presentations and reports.</p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Built With</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="text-center p-4">
              <div className="text-2xl mb-2">⚛️</div>
              <h3 className="font-semibold">Next.js 14</h3>
              <p className="text-sm text-gray-600">App Router + TypeScript</p>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl mb-2">🗄️</div>
              <h3 className="font-semibold">Supabase</h3>
              <p className="text-sm text-gray-600">PostgreSQL + Auth</p>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl mb-2">🤖</div>
              <h3 className="font-semibold">OpenAI</h3>
              <p className="text-sm text-gray-600">GPT-4o-mini</p>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="font-semibold">Tailwind CSS</h3>
              <p className="text-sm text-gray-600">Modern UI</p>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="p-8 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to see it in action?</h2>
          <p className="text-gray-600 mb-6">Try the demo now - no signup required. See how AI can transform your feedback analysis.</p>
          <Link href="/demo">
            <Button size="lg" className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700">
              🚀 Launch Demo
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-3">Built in 2 weeks • Open source • No account needed</p>
        </div>
      </div>
    </div>
  )
} 