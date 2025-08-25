import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set(name, value)
          res.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          req.cookies.set(name, '')
          res.cookies.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  );
  await supabase.auth.getSession();
  return res;
}

export const config = { matcher: ["/app/:path*", "/dashboard/:path*", "/feedback/:path*", "/insights/:path*", "/search/:path*", "/settings/:path*", "/add-feedback/:path*", "/analytics/:path*", "/ingest/:path*"] }; 