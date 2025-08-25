import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRoute } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  
  if (code) {
    const supabase = createRoute();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }
  
  return NextResponse.redirect(`${origin}/app`);
} 