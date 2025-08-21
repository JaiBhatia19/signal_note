import { createClient } from "@supabase/supabase-js"

export const getSupabaseBrowser = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    throw new Error('Supabase environment variables are not set')
  }
  
  return createClient(url, key)
} 