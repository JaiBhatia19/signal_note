'use client'

import Link from 'next/link'
import Button from './Button'

export default function Nav() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              SignalNote
            </Link>
            
            <Link href="/demo" className="text-gray-600 hover:text-gray-900">
              🚀 Demo
            </Link>
            
            <a 
              href="https://github.com/JaiBhatia19/signal_note" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              👀 Code
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/demo">
              <Button size="sm">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 