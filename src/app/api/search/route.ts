import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"
import { getOpenAI } from "@/lib/openai"

export async function POST(req: Request) {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { q, source, userSegment, productArea, priority } = await req.json()
  if (!q) return NextResponse.json({ results: [] })

  const openai = getOpenAI()
  const emb = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: q
  })
  const queryEmbedding = emb.data[0].embedding

  // Use the enhanced match_feedback function with filters
  const { data, error } = await supabase.rpc("match_feedback", {
    query_embedding: queryEmbedding,
    match_threshold: 0.75,
    match_count: 10,
    search_user_id: user.id,
    filter_source: source || null,
    filter_segment: userSegment || null,
    filter_area: productArea || null,
    filter_priority: priority || null
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ results: data })
} 