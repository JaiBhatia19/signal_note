import { createServerClient } from '@supabase/ssr'
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const createServer = () => createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
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
  }
)

export const createRoute = () => createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
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
  }
)

export const createMiddleware = () => createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
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
  }
) 