import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServer } from "@/lib/supabase";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

export default async function AppHome() {
  const supabase = createServer();
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data.user) redirect("/login");
  
  const handleSignOut = async () => {
    'use server'
    const supabase = createServer();
    await supabase.auth.signOut();
    redirect('/login');
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to SignalNote</h1>
          <p className="text-gray-600 mb-6">You are successfully signed in!</p>
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <p className="text-sm text-blue-800">
              <strong>Email:</strong> {data.user.email}
            </p>
          </div>
          <div className="space-y-3">
            <Link 
              href="/app/demo" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors w-full"
            >
              Try Demo
            </Link>
            <form action={handleSignOut}>
              <button 
                type="submit"
                className="inline-block bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors w-full"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 