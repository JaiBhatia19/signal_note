import { createClient } from "@supabase/supabase-js"

export const getSupabaseBrowser = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('Supabase URL:', url)
  console.log('Supabase Key exists:', !!key)
  
  if (!url || !key) {
    console.error('Missing Supabase environment variables:', { url: !!url, key: !!key })
    throw new Error('Supabase environment variables are not set')
  }
  
  try {
    const client = createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
    console.log('Supabase client created successfully')
    return client
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    throw error
  }
} 