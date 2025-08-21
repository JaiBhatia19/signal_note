import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import Container from '@/components/Container'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SignalNote - Customer Feedback Analysis',
  description: 'Analyze customer feedback with AI-powered insights and semantic search',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Nav />
          <main className="min-h-screen bg-gray-50 py-8">
            <Container>
              {children}
            </Container>
          </main>
        </ErrorBoundary>
      </body>
    </html>
  )
} 