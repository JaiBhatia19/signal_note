import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic'

export default async function DebugPage() {
  const supabase = supabaseServer()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Authentication Status:</h2>
            {error ? (
              <p className="text-red-600">Error: {error.message}</p>
            ) : user ? (
              <div className="bg-green-100 p-4 rounded">
                <p className="text-green-800">✅ User is authenticated</p>
                <p>Email: {user.email}</p>
                <p>ID: {user.id}</p>
              </div>
            ) : (
              <div className="bg-yellow-100 p-4 rounded">
                <p className="text-yellow-800">⚠️ No user found</p>
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Environment Variables:</h2>
            <div className="bg-gray-100 p-4 rounded text-sm">
              <p>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}</p>
              <p>SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</p>
              <p>SUPABASE_SERVICE_ROLE_KEY: {process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not set'}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Actions:</h2>
            <div className="space-y-2">
              <a href="/login" className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Go to Login
              </a>
              <a href="/dashboard" className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Try Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (err: any) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Page - Error</h1>
        <div className="bg-red-100 p-4 rounded">
          <p className="text-red-800">Error occurred: {err.message}</p>
          <pre className="mt-2 text-sm">{err.stack}</pre>
        </div>
      </div>
    )
  }
} 