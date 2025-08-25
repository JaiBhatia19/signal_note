'use client'

import Link from 'next/link'
import Button from './Button'

export default function Nav() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900" data-testid="logo">
              SignalNote
            </Link>
            
            <Link href="/demo" className="text-gray-600 hover:text-gray-900" data-testid="nav-demo">
              🚀 Demo
            </Link>
            
            <Link href="/ingest" className="text-gray-600 hover:text-gray-900" data-testid="nav-ingest">
              📊 Ingest
            </Link>
            
            <Link href="/insights" className="text-gray-600 hover:text-gray-900" data-testid="nav-insights">
              🔍 Insights  
            </Link>
            
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900" data-testid="nav-pricing">
              💰 Pricing
            </Link>
            
            <a 
              href="https://github.com/JaiBhatia19/signal_note" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
              data-testid="nav-github"
            >
              👀 Code
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/waitlist">
              <Button variant="outline" size="sm" data-testid="nav-waitlist">
                Join Waitlist
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="sm" data-testid="nav-try-demo">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 