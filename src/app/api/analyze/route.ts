import { NextResponse } from "next/server";
export const runtime = "nodejs";

import { supabaseServer } from "@/lib/supabase/server";
import { getOpenAI } from "@/lib/ai/openai";

export async function POST(request: any) {
  try {
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lines } = await request.json()
    
    if (!Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: 'Lines array is required' }, { status: 400 })
    }

    const results = []
    
    // Check if OpenAI key is available
    const openai = getOpenAI()
    
    if (openai) {
      try {
        for (const line of lines) {
          const prompt = `Analyze this feedback line and return JSON with:
- sentiment: 0-100 score (0=very negative, 100=very positive)
- urgency: "low", "medium", or "high"
- theme: 1-3 words describing the main topic
- action: one short sentence suggesting what to do

Feedback: "${line}"

Return only valid JSON:`

          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            max_tokens: 150
          })

          const content = completion.choices[0]?.message?.content
          let parsed
          
          try {
            parsed = JSON.parse(content || '{}')
          } catch {
            parsed = {}
          }

          results.push({
            text: line,
            sentiment: parsed.sentiment || 50,
            urgency: parsed.urgency || 'medium',
            theme: parsed.theme || 'General',
            action: parsed.action || 'Review feedback'
          })
        }
      } catch (error) {
        console.error('OpenAI error:', error)
        // Fall through to deterministic fallback
      }
    }
    
    // If OpenAI failed or no key, use deterministic fallback
    if (results.length === 0) {
      for (const line of lines) {
        const lowerLine = line.toLowerCase()
        
        // Simple sentiment analysis
        let sentiment = 50
        if (lowerLine.includes('great') || lowerLine.includes('love') || lowerLine.includes('awesome')) sentiment = 80
        else if (lowerLine.includes('good') || lowerLine.includes('nice') || lowerLine.includes('like')) sentiment = 70
        else if (lowerLine.includes('bad') || lowerLine.includes('hate') || lowerLine.includes('terrible')) sentiment = 20
        else if (lowerLine.includes('slow') || lowerLine.includes('bug') || lowerLine.includes('broken')) sentiment = 30
        
        // Simple urgency detection
        let urgency: 'low' | 'medium' | 'high' = 'medium'
        if (lowerLine.includes('urgent') || lowerLine.includes('critical') || lowerLine.includes('broken')) urgency = 'high'
        else if (lowerLine.includes('nice to have') || lowerLine.includes('suggestion')) urgency = 'low'
        
        // Simple theme extraction
        let theme = 'General'
        if (lowerLine.includes('speed') || lowerLine.includes('slow') || lowerLine.includes('fast')) theme = 'Performance'
        else if (lowerLine.includes('ui') || lowerLine.includes('interface') || lowerLine.includes('design')) theme = 'User Interface'
        else if (lowerLine.includes('search') || lowerLine.includes('find')) theme = 'Search'
        else if (lowerLine.includes('bug') || lowerLine.includes('error') || lowerLine.includes('crash')) theme = 'Bug Fix'
        
        // Simple action suggestion
        let action = 'Review feedback'
        if (urgency === 'high') action = 'Prioritize for next sprint'
        else if (urgency === 'medium') action = 'Add to roadmap'
        else action = 'Consider for future release'
        
        results.push({ text: line, sentiment, urgency, theme, action })
      }
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('Analyze API error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
} 