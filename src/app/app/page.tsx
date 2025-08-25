import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

export default async function AppHome() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookies().set(name, value, options)
        },
        remove(name: string, options: any) {
          cookies().set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  );
  
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to SignalNote</h1>
          <p className="text-gray-600 mb-6">You are successfully signed in!</p>
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Email:</strong> {data.user.email}
            </p>
          </div>
          <div className="mt-6">
            <a 
              href="/dashboard" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 