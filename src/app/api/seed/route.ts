import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"
import { getOpenAI } from "@/lib/openai"

// Only enable in development
const isDev = process.env.NODE_ENV === 'development'

export async function POST() {
  if (!isDev) {
    return NextResponse.json({ error: "Seed only available in development" }, { status: 403 })
  }

  try {
    const supabase = getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const sampleFeedback = [
      {
        content: "The app crashes when I try to upload large files. This happens every time with files over 10MB. Please fix this issue as it's blocking my workflow.",
        source: "Support Ticket"
      },
      {
        content: "I love the new dashboard design! The charts are much clearer and the data visualization is really helpful for understanding user behavior.",
        source: "User Survey"
      },
      {
        content: "The search function is too slow. It takes 5-10 seconds to return results, which makes it unusable for quick lookups. Need performance improvements.",
        source: "Feedback Form"
      },
      {
        content: "The mobile app needs better offline support. When I'm on the train without internet, I can't access my saved documents. This is a major pain point.",
        source: "User Interview"
      },
      {
        content: "The pricing is too expensive for small teams. We're a startup with 5 people and can't afford $50/user/month. Please consider a startup-friendly tier.",
        source: "Sales Call"
      }
    ]

    const createdFeedback = []

    for (const feedback of sampleFeedback) {
      // Generate embedding
      const openai = getOpenAI()
      const emb = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: feedback.content
      })
      const embedding = emb.data[0].embedding

      // Insert feedback
      const { data, error } = await supabase.from("feedback").insert({
        user_id: user.id,
        source: feedback.source,
        content: feedback.content,
        embedding
      }).select().single()

      if (error) {
        console.error('Error inserting feedback:', error)
        continue
      }

      createdFeedback.push(data)
    }

    return NextResponse.json({ 
      message: `Created ${createdFeedback.length} sample feedback items`,
      feedback: createdFeedback
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
} 