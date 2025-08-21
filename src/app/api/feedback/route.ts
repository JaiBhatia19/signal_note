import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"
import { getOpenAI } from "@/lib/openai"
import { withValidation, ValidationSchema } from "@/lib/validation"

const feedbackSchema: ValidationSchema = {
  content: {
    required: true,
    minLength: 10,
    maxLength: 10000
  },
  source: {
    required: true,
    pattern: /^(Manual|Zoom|Slack|Email|Survey|Support|User Interview|App Store Review)$/
  }
}

async function handleFeedback(req: Request) {
  try {
    const supabase = getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { content, source } = await req.json()

    // Validate OpenAI API key
    const openai = getOpenAI()
    const emb = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: content
    })
    const embedding = emb.data[0].embedding

    const { error } = await supabase.from("feedback").insert({
      user_id: user.id, 
      source: source || "Manual", 
      content, 
      embedding
    })
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Feedback API error:', e)
    
    if (e.message.includes('OPENAI_API_KEY')) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 503 })
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const POST = withValidation(feedbackSchema)(handleFeedback) 