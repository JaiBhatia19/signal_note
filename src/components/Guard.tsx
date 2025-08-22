import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase-server'

interface GuardProps {
  children: ReactNode
  requirePro?: boolean
}

export default async function Guard({ children, requirePro = false }: GuardProps) {
  try {
    const supabase = getSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Auth error:', authError)
      redirect('/login')
    }
    
    if (!user) {
      console.log('No user found, redirecting to login')
      redirect('/login')
    }

    if (requirePro) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        console.error('Profile error:', profileError)
        redirect('/login')
      }
      
      if (profile?.role !== 'pro') {
        redirect('/settings?upgrade=1')
      }
    }

    return <>{children}</>
  } catch (error) {
    console.error('Guard error:', error)
    redirect('/login')
  }
} 