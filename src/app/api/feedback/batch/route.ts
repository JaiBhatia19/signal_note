import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import OpenAI from 'openai'

export const runtime = "nodejs"

// Simple in-memory job tracking (in production, use Redis or database)
const jobs = new Map<string, { status: 'pending' | 'processing' | 'completed' | 'failed', progress: number, error?: string }>()

export async function POST(request: NextRequest) {
  try {
    const { itemIds, userId } = await request.json()
    
    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ error: 'Invalid item IDs' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Validate user owns these items
    const supabase = createClient()
    const { data: items, error: fetchError } = await supabase
      .from('feedback_items')
      .select('id, text')
      .in('id', itemIds)
      .eq('user_id', userId)

    if (fetchError || !items || items.length !== itemIds.length) {
      return NextResponse.json({ error: 'Items not found or access denied' }, { status: 403 })
    }

    // Create job
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    jobs.set(jobId, { status: 'pending', progress: 0 })

    // Start processing in background
    processBatch(jobId, items, userId)

    return NextResponse.json({ jobId, status: 'started' })

  } catch (error) {
    console.error('Batch analysis error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    const job = jobs.get(jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json(job)

  } catch (error) {
    console.error('Job status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function processBatch(jobId: string, items: any[], userId: string) {
  const job = jobs.get(jobId)
  if (!job) return

  try {
    job.status = 'processing'
    job.progress = 0
    jobs.set(jobId, job)

    const supabase = createClient()
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    
    const batchSize = 5 // Process in small batches to avoid timeouts
    const totalItems = items.length
    let processed = 0

    for (let i = 0; i < totalItems; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      
      // Process batch
      const batchPromises = batch.map(async (item) => {
        try {
          const analysis = await analyzeFeedback(item.text, openai)
          
          // Save analysis
          const { error: insertError } = await supabase
            .from('analyses')
            .insert({
              item_id: item.id,
              sentiment_number: analysis.sentiment,
              urgency_text: analysis.urgency,
              theme_text: analysis.theme,
              action_text: analysis.action
            })

          if (insertError) {
            console.error('Failed to save analysis:', insertError)
            return false
          }

          return true
        } catch (error) {
          console.error('Analysis failed for item:', item.id, error)
          return false
        }
      })

      await Promise.all(batchPromises)
      processed += batch.length
      
      // Update progress
      job.progress = Math.round((processed / totalItems) * 100)
      jobs.set(jobId, job)

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Mark as completed
    job.status = 'completed'
    job.progress = 100
    jobs.set(jobId, job)

  } catch (error) {
    console.error('Batch processing failed:', error)
    job.status = 'failed'
    job.error = error instanceof Error ? error.message : 'Unknown error'
    jobs.set(jobId, job)
  }
}

async function analyzeFeedback(text: string, openai: OpenAI) {
  try {
    const prompt = `Analyze this customer feedback and provide:
1. Sentiment score (0-100, where 0 is very negative, 100 is very positive)
2. Urgency level (low, medium, or high)
3. Theme (up to 3 words describing the main topic)
4. Action suggestion (one sentence recommendation)

Feedback: "${text}"

Respond in JSON format:
{
  "sentiment": 75,
  "urgency": "medium",
  "theme": "user interface",
  "action": "Improve the navigation menu design based on user feedback."
}`

    const completion = await openai.chat.completions.create({
      model: process.env.ANALYSIS_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 200
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from OpenAI')

    const analysis = JSON.parse(response)
    
    // Validate and normalize
    return {
      sentiment: Math.max(0, Math.min(100, parseInt(analysis.sentiment) || 50)),
      urgency: ['low', 'medium', 'high'].includes(analysis.urgency) ? analysis.urgency : 'medium',
      theme: (analysis.theme || 'general feedback').substring(0, 50),
      action: (analysis.action || 'Review and consider this feedback.').substring(0, 200)
    }

  } catch (error) {
    console.error('OpenAI analysis failed:', error)
    
    // Fallback to deterministic analysis
    const words = text.toLowerCase().split(/\s+/)
    const sentiment = words.some(w => ['good', 'great', 'love', 'awesome', 'excellent'].includes(w)) ? 75 :
                     words.some(w => ['bad', 'terrible', 'hate', 'awful', 'horrible'].includes(w)) ? 25 : 50
    
    const urgency = words.some(w => ['urgent', 'critical', 'broken', 'crash', 'error'].includes(w)) ? 'high' :
                   words.some(w => ['slow', 'issue', 'problem', 'bug'].includes(w)) ? 'medium' : 'low'
    
    const theme = words.slice(0, 3).join(' ').substring(0, 30) || 'general feedback'
    const action = 'Review this feedback for potential improvements.'
    
    return { sentiment, urgency, theme, action }
  }
} 