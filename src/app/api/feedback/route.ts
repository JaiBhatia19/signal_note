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
    pattern: /^(Manual|Zoom|Slack|Email|Survey|Support|User Interview|App Store Review|Intercom|Zendesk|Hotjar|FullStory)$/
  },
  userSegment: {
    required: false,
    maxLength: 100
  },
  productArea: {
    required: false,
    maxLength: 100
  },
  priority: {
    required: true,
    pattern: /^(low|medium|high|critical)$/
  }
}

const ANALYSIS_PROMPT = `
Analyze this customer feedback and provide:
1. Sentiment score (0-1, where 0 is very negative, 1 is very positive)
2. Urgency score (0-1, where 0 is not urgent, 1 is critical)
3. Key insights (3-5 bullet points)
4. Suggested action items
5. Business impact assessment

Return as JSON:
{
  "sentiment_score": 0.3,
  "urgency_score": 0.8,
  "insights": ["point 1", "point 2"],
  "action_items": ["action 1", "action 2"],
  "business_impact": "high/medium/low"
}

Feedback: {content}
Source: {source}
User Segment: {userSegment}
Product Area: {productArea}
Priority: {priority}
`

async function handleFeedback(req: Request) {
  try {
    const supabase = getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { content, source, userSegment, productArea, priority } = await req.json()

    // Validate OpenAI API key
    const openai = getOpenAI()
    
    // Generate embedding
    const emb = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: content
    })
    const embedding = emb.data[0].embedding

    // AI Analysis
    let aiInsights = null
    let sentimentScore = null
    let urgencyScore = null
    
    try {
      const analysisResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are a customer feedback analyst. Return only valid JSON." 
          },
          { 
            role: "user", 
            content: ANALYSIS_PROMPT
              .replace('{content}', content)
              .replace('{source}', source)
              .replace('{userSegment}', userSegment || 'Not specified')
              .replace('{productArea}', productArea || 'Not specified')
              .replace('{priority}', priority)
          }
        ],
        temperature: 0.3
      })

      const analysisContent = analysisResponse.choices[0].message.content
      if (analysisContent) {
        const analysis = JSON.parse(analysisContent)
        aiInsights = {
          insights: analysis.insights || [],
          action_items: analysis.action_items || [],
          business_impact: analysis.business_impact || 'medium'
        }
        sentimentScore = analysis.sentiment_score
        urgencyScore = analysis.urgency_score
      }
    } catch (analysisError) {
      console.warn('AI analysis failed, continuing without insights:', analysisError)
    }

    const { error } = await supabase.from("feedback").insert({
      user_id: user.id, 
      source: source || "Manual", 
      content, 
      user_segment: userSegment || null,
      product_area: productArea || null,
      priority: priority || "medium",
      sentiment_score: sentimentScore,
      urgency_score: urgencyScore,
      ai_insights: aiInsights,
      embedding
    })
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 })
    }

    return NextResponse.json({ 
      ok: true, 
      analysis: aiInsights ? 'completed' : 'failed',
      sentiment: sentimentScore,
      urgency: urgencyScore
    })
  } catch (e: any) {
    console.error('Feedback API error:', e)
    
    if (e.message.includes('OPENAI_API_KEY')) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 503 })
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getFeedback(req: Request) {
  try {
    const supabase = getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const source = searchParams.get('source')
    const userSegment = searchParams.get('userSegment')
    const productArea = searchParams.get('productArea')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    let query = supabase
      .from('feedback')
      .select('*')
      .eq('user_id', user.id)

    // Apply filters
    if (source) query = query.eq('source', source)
    if (userSegment) query = query.eq('user_segment', userSegment)
    if (productArea) query = query.eq('product_area', productArea)
    if (priority) query = query.eq('priority', priority)
    if (search) query = query.ilike('content', `%${search}%`)

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    const { data: feedback, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
    }

    return NextResponse.json({ feedback: feedback || [] })
  } catch (e: any) {
    console.error('Get feedback error:', e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const POST = withValidation(feedbackSchema)(handleFeedback)
export const GET = getFeedback 