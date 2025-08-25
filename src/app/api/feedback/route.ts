import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { applyRateLimit, apiRateLimit } from '@/lib/rate-limit'
import { env } from '@/lib/env'
import OpenAI from 'openai'

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = applyRateLimit(request, apiRateLimit)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const supabase = getSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Invalid JSON in request body' 
      }, { status: 400 })
    }

    const { text, source, userSegment, productArea } = body

    // Enhanced validation
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Feedback text is required and must be a non-empty string' 
      }, { status: 400 })
    }

    if (text.length > 10000) {
      return NextResponse.json({ 
        error: 'Feedback text too long (maximum 10,000 characters)' 
      }, { status: 400 })
    }

    // Validate optional fields
    if (source && typeof source !== 'string') {
      return NextResponse.json({ 
        error: 'Source must be a string' 
      }, { status: 400 })
    }

    if (userSegment && typeof userSegment !== 'string') {
      return NextResponse.json({ 
        error: 'User segment must be a string' 
      }, { status: 400 })
    }

    if (productArea && typeof productArea !== 'string') {
      return NextResponse.json({ 
        error: 'Product area must be a string' 
      }, { status: 400 })
    }

    // AI Analysis
    let analysis = null
    let sentiment = 0
    let urgency = 0
    let businessImpact = 1

    try {
      const prompt = `Analyze this customer feedback and provide insights:

Feedback: "${text}"
Source: ${source || 'Unknown'}
User Segment: ${userSegment || 'Unknown'}
Product Area: ${productArea || 'Unknown'}

Please provide:
1. Sentiment score (0-1, where 0 is very negative, 1 is very positive)
2. Urgency score (0-1, where 0 is not urgent, 1 is very urgent)
3. Business impact (1-5, where 1 is low impact, 5 is high impact)
4. Key insights (2-3 bullet points)
5. Suggested action items (2-3 bullet points)

Format as JSON:
{
  "sentiment": 0.7,
  "urgency": 0.8,
  "businessImpact": 4,
  "insights": ["insight 1", "insight 2"],
  "actionItems": ["action 1", "action 2"]
}`

      const completion = await openai.chat.completions.create({
        model: env.ANALYSIS_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      })

      const analysisText = completion.choices[0]?.message?.content
      if (analysisText) {
        try {
          const parsed = JSON.parse(analysisText)
          sentiment = Math.max(0, Math.min(1, parsed.sentiment || 0.5))
          urgency = Math.max(0, Math.min(1, parsed.urgency || 0.5))
          businessImpact = Math.max(1, Math.min(5, parsed.businessImpact || 3))
          analysis = {
            insights: Array.isArray(parsed.insights) ? parsed.insights : [],
            actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
            rawAnalysis: analysisText
          }
        } catch (parseError) {
          console.error('Failed to parse AI analysis:', parseError)
          // Fallback to basic analysis
          analysis = {
            insights: ['AI analysis completed but parsing failed'],
            actionItems: ['Review feedback manually'],
            rawAnalysis: analysisText
          }
        }
      }
    } catch (aiError) {
      console.error('AI analysis failed:', aiError)
      // Continue without AI analysis
      analysis = {
        insights: ['AI analysis temporarily unavailable'],
        actionItems: ['Review feedback manually'],
        error: 'AI analysis failed'
      }
    }

    // Generate embedding for semantic search
    let embedding = null
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: env.EMBEDDINGS_MODEL || 'text-embedding-3-small',
        input: text,
      })
      embedding = embeddingResponse.data[0]?.embedding
    } catch (embeddingError) {
      console.error('Embedding generation failed:', embeddingError)
      // Continue without embedding
    }

    // Save to database
    const { data: feedback, error: dbError } = await supabase
      .from('feedback')
      .insert({
        owner_id: user.id,
        source: source || 'manual',
        user_segment: userSegment || 'general',
        product_area: productArea || 'general',
        text: text.trim(),
        analysis,
        sentiment,
        urgency,
        business_impact: businessImpact,
        embedding,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ 
        error: 'Failed to save feedback to database',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      }, { status: 500 })
    }

    // Track event
    try {
      await supabase
        .from('events')
        .insert({
          owner_id: user.id,
          name: 'feedback_added',
          data: {
            feedback_id: feedback.id,
            has_ai_analysis: !!analysis,
            has_embedding: !!embedding,
            text_length: text.length,
          }
        })
    } catch (eventError) {
      console.error('Failed to track event:', eventError)
      // Don't fail the request if event tracking fails
    }

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        text: feedback.text,
        analysis,
        sentiment,
        urgency,
        business_impact: businessImpact,
        created_at: feedback.created_at,
      }
    })

  } catch (error) {
    console.error('Feedback API error:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return NextResponse.json({ 
          error: 'External service temporarily unavailable' 
        }, { status: 503 })
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = applyRateLimit(request, apiRateLimit)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const supabase = getSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({ 
        error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.' 
      }, { status: 400 })
    }

    // Get feedback with pagination
    const { data: feedback, error: dbError, count } = await supabase
      .from('feedback')
      .select('*', { count: 'exact' })
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ 
        error: 'Failed to fetch feedback from database',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      }, { status: 500 })
    }

    return NextResponse.json({
      feedback: feedback || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
        hasNext: (page * limit) < (count || 0),
        hasPrev: page > 1,
      }
    })

  } catch (error) {
    console.error('Feedback GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 