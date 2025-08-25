import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"
import OpenAI from 'openai'

export const runtime = "nodejs";

const CLUSTER_PROMPT = (items: string) => `
You are a senior product manager analyzing customer feedback. Group similar feedback into 3-7 clusters and provide:

For each cluster:
- Descriptive title (max 6 words)
- Summary description (1-2 sentences)
- Main theme (e.g., "Performance", "UX", "Pricing", "Features")
- Sentiment trend (positive/negative/mixed)
- Urgency level (low/medium/high/critical)
- Affected user segments (if mentioned)
- Affected product areas (if mentioned)
- Business impact (high/medium/low)
- Suggested priority (1-5, where 1 is highest)

Return JSON:
[{
  "title": "string",
  "description": "string", 
  "theme": "string",
  "sentiment_trend": "string",
  "urgency_level": "string",
  "affected_segments": ["string"],
  "affected_areas": ["string"],
  "business_impact": "string",
  "priority": 1,
  "indices": [number]
}]

Feedback list:
${items}
`

export async function POST() {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("feedback")
    .select("id, text, user_segment, product_area, sentiment, urgency, business_impact")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const lines = data.map((d, i) => `${i}. ${d.text}${d.user_segment ? ` [${d.user_segment}]` : ''}${d.product_area ? ` (${d.product_area})` : ''}`).join("\n")

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You return concise JSON only. Be strategic and business-focused." },
      { role: "user", content: CLUSTER_PROMPT(lines) }
    ],
    temperature: 0.2
  })

  let parsed = []
  try {
    parsed = JSON.parse(resp.choices[0].message.content || "[]")
  } catch {
    parsed = []
  }

  // Map indices back to feedback ids and create clusters
  const withIds = parsed.map((c: any) => ({
    title: c.title,
    description: c.description,
    theme: c.theme,
    sentiment_trend: c.sentiment_trend,
    urgency_level: c.urgency_level,
    affected_segments: c.affected_segments || [],
    affected_areas: c.affected_areas || [],
    business_impact: c.business_impact || 'medium',
    priority: c.priority || 3,
    ids: (c.indices || []).map((i: number) => data[i]?.id).filter(Boolean),
    feedback_count: (c.indices || []).length
  }))

  // Sort by priority (1 is highest)
  withIds.sort((a: any, b: any) => a.priority - b.priority)

  return NextResponse.json({ clusters: withIds })
} 