import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"
import { withValidation, ValidationSchema } from "@/lib/validation"

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { title, description } = await req.json()
    if (!title) return NextResponse.json({ error: "missing title" }, { status: 400 })

    const { error } = await supabase.from("feature_requests").insert({
      user_id: user.id,
      title,
      description,
      status: 'open'
    })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { data, error } = await supabase
      .from("feature_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ feature_requests: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
} 