import OpenAI from 'openai';
import { env } from './env';

// Lazy-load OpenAI client to avoid build-time instantiation
function getOpenAI() {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
}

export interface FeedbackAnalysis {
  sentiment: number;
  urgency: number;
  insights: string[];
  business_impact: number;
}

export interface AnalysisResult {
  analysis: FeedbackAnalysis;
  embedding: number[];
}

// Analysis prompt template
const ANALYSIS_PROMPT = `You are an AI system analyzing customer feedback. Given this text, return JSON:

{
  "sentiment": float 0-1 (0 = very negative, 1 = very positive),
  "urgency": float 0-1 (0 = not urgent, 1 = very urgent),
  "insights": [up to 3 short actionable bullet points],
  "business_impact": integer 1-5 (1 = low impact, 5 = high impact)
}

Feedback text: `;

export async function analyzeFeedback(text: string): Promise<FeedbackAnalysis> {
  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: env.ANALYSIS_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a customer feedback analyst. Return only valid JSON.'
        },
        {
          role: 'user',
          content: ANALYSIS_PROMPT + text
        }
      ],
      temperature: 0.1,
      max_tokens: 300,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    const analysis = JSON.parse(jsonMatch[0]) as FeedbackAnalysis;
    
    // Validate and normalize
    return {
      sentiment: Math.max(0, Math.min(1, analysis.sentiment)),
      urgency: Math.max(0, Math.min(1, analysis.urgency)),
      insights: analysis.insights?.slice(0, 3) || [],
      business_impact: Math.max(1, Math.min(5, analysis.business_impact)),
    };
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    // Return default values on error
    return {
      sentiment: 0.5,
      urgency: 0.5,
      insights: ['Analysis failed'],
      business_impact: 3,
    };
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const openai = getOpenAI();
    const response = await openai.embeddings.create({
      model: env.EMBEDDINGS_MODEL || 'text-embedding-3-small',
      input: text,
    });

    return response.data[0]?.embedding || [];
  } catch (error) {
    console.error('OpenAI embedding error:', error);
    // Return zero vector on error
    return new Array(1536).fill(0);
  }
}

export async function analyzeAndEmbed(text: string): Promise<AnalysisResult> {
  const [analysis, embedding] = await Promise.all([
    analyzeFeedback(text),
    generateEmbedding(text),
  ]);

  return { analysis, embedding };
}

// Hash function for caching
export function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
} 