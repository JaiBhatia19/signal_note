import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddleware } from "@/lib/supabase";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddleware();
  await supabase.auth.getSession();
  return res;
}

export const config = { matcher: ["/app/:path*"] }; 