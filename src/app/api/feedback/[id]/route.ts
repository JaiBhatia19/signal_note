import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"
import { generateEmbedding } from "@/lib/openai"

export const runtime = "nodejs";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { content, source } = await req.json()

    // Verify ownership
    const { data: existing } = await supabase
      .from('feedback')
      .select('id')
      .eq('id', params.id)
      .eq('owner_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "not found" }, { status: 404 })
    }

    // Update embedding if content changed
    let embedding
    if (content) {
      embedding = await generateEmbedding(content)
    }

    const { error } = await supabase
      .from('feedback')
      .update({ 
        text: content, 
        source, 
        ...(embedding && { embedding }),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('feedback')
      .select('id')
      .eq('id', params.id)
      .eq('owner_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "not found" }, { status: 404 })
    }

    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 