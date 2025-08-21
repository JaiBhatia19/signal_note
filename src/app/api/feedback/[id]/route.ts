import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"
import { getOpenAI } from "@/lib/openai"

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
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "not found" }, { status: 404 })
    }

    // Update embedding if content changed
    let embedding
    if (content) {
      const openai = getOpenAI()
      const emb = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: content
      })
      embedding = emb.data[0].embedding
    }

    const { error } = await supabase
      .from('feedback')
      .update({ 
        content, 
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
      .eq('user_id', user.id)
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