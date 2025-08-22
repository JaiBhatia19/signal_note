import { createClient } from "@supabase/supabase-js"

// Create a singleton instance to prevent multiple clients
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseBrowser = () => {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('Creating new Supabase client...')
  console.log('Supabase URL:', url)
  console.log('Supabase Key exists:', !!key)
  
  if (!url || !key) {
    console.error('Missing Supabase environment variables:', { url: !!url, key: !!key })
    throw new Error('Supabase environment variables are not set')
  }
  
  try {
    supabaseClient = createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
    console.log('Supabase client created successfully')
    return supabaseClient
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    throw error
  }
}

// Export the client directly for components that need it
export const supabase = getSupabaseBrowser() 