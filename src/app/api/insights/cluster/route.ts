import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"
import { getOpenAI } from "@/lib/openai"

const CLUSTER_PROMPT = (items: string) => `
You group similar feedback into 3 to 7 clusters. Each cluster has:
- short title
- bullet list of feedback indices
Return JSON with [{title: string, indices: number[]}].

Feedback list:
${items}
`

export async function POST() {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("feedback")
    .select("id, content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const lines = data.map((d, i) => `${i}. ${d.content}`).join("\n")

  const openai = getOpenAI()
  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You return concise JSON only." },
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

  // Map indices back to feedback ids
  const withIds = parsed.map((c: any) => ({
    title: c.title,
    ids: (c.indices || []).map((i: number) => data[i]?.id).filter(Boolean)
  }))

  return NextResponse.json({ clusters: withIds })
} 