'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client';
import Button from './Button'
import Badge from './Badge'

export default function Nav() {
  const [user, setUser] = useState<any>(null)
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const supabase = supabaseBrowser
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setIsPro((profile as any)?.role === 'pro')
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(async (event: any, session: any) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await supabaseBrowser
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setIsPro((profile as any)?.role === 'pro')
      } else {
        setIsPro(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabaseBrowser.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                SignalNote
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              SignalNote
            </Link>
            
            {user && (
              <>
                <Link href="/app" className="text-gray-600 hover:text-gray-900">
                  App
                </Link>
                <Link href="/demo" className="text-gray-600 hover:text-gray-900">
                  Demo
                </Link>
                <Link href="/settings" className="text-gray-600 hover:text-gray-900">
                  Settings
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {!isPro && (
                  <Link href="/settings">
                    <Badge variant="warning" className="cursor-pointer">
                      Upgrade to Pro
                    </Badge>
                  </Link>
                )}
                <span className="text-sm text-gray-600">{user.email}</span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 