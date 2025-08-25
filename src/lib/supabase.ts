import { createServerClient } from '@supabase/ssr'
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export const createServer = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return require('next/headers').cookies().get(name)?.value
      },
      set(name: string, value: string, options: any) {
        require('next/headers').cookies().set(name, value, options)
      },
      remove(name: string, options: any) {
        require('next/headers').cookies().set(name, '', { ...options, maxAge: 0 })
      },
    },
  })
}

export const createRoute = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return require('next/headers').cookies().get(name)?.value
      },
      set(name: string, value: string, options: any) {
        require('next/headers').cookies().set(name, value, options)
      },
      remove(name: string, options: any) {
        require('next/headers').cookies().set(name, '', { ...options, maxAge: 0 })
      },
    },
  })
}

// Middleware client without cookies for Edge runtime compatibility
export const createMiddleware = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {}
  })
} 