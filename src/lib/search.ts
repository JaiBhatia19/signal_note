import { createClient } from '@supabase/supabase-js';
import { PUBLIC_APP_URL, env } from './env';
import { generateEmbedding } from './openai';

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY!);

export interface SearchResult {
  id: number;
  text: string;
  source: string | null;
  user_segment: string | null;
  product_area: string | null;
  sentiment: number | null;
  urgency: number | null;
  business_impact: number | null;
  created_at: string;
  similarity: number;
}

export interface SearchFilters {
  source?: string;
  user_segment?: string;
  product_area?: string;
  date_from?: string;
  date_to?: string;
  min_similarity?: number;
}

export async function searchFeedback(
  query: string,
  userId: string,
  filters: SearchFilters = {},
  limit: number = 10
): Promise<SearchResult[]> {
  try {
    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query);
    
    // Build the search query
    let supabaseQuery = supabase
      .from('feedback')
      .select(`
        id,
        text,
        source,
        user_segment,
        product_area,
        sentiment,
        urgency,
        business_impact,
        created_at
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.source) {
      supabaseQuery = supabaseQuery.eq('source', filters.source);
    }
    if (filters.user_segment) {
      supabaseQuery = supabaseQuery.eq('user_segment', filters.user_segment);
    }
    if (filters.product_area) {
      supabaseQuery = supabaseQuery.eq('product_area', filters.product_area);
    }
    if (filters.date_from) {
      supabaseQuery = supabaseQuery.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      supabaseQuery = supabaseQuery.lte('created_at', filters.date_to);
    }

    // Get all matching feedback first
    const { data: feedback, error } = await supabaseQuery.limit(1000);
    
    if (error) {
      console.error('Search error:', error);
      return [];
    }

    if (!feedback || feedback.length === 0) {
      return [];
    }

    // Calculate similarity scores using pgvector
    const similarityQuery = `
      SELECT 
        id,
        text,
        source,
        user_segment,
        product_area,
        sentiment,
        urgency,
        business_impact,
        created_at,
        1 - (embedding <=> $1) as similarity
      FROM feedback 
      WHERE id = ANY($2)
      ORDER BY embedding <=> $1
      LIMIT $3
    `;

    const feedbackIds = feedback.map(f => f.id);
    const { data: results, error: similarityError } = await supabase.rpc('exec_sql', {
      sql: similarityQuery,
      params: [queryEmbedding, feedbackIds, limit]
    });

    if (similarityError) {
      console.error('Similarity calculation error:', similarityError);
      // Fallback to simple text search
      return feedback
        .slice(0, limit)
        .map(f => ({
          ...f,
          similarity: 0.5 // Default similarity
        }));
    }

    // Filter by minimum similarity if specified
    const minSimilarity = filters.min_similarity || 0.1;
    const filteredResults = results
      .filter((r: any) => r.similarity >= minSimilarity)
      .slice(0, limit);

    return filteredResults.map((r: any) => ({
      id: r.id,
      text: r.text,
      source: r.source,
      user_segment: r.user_segment,
      product_area: r.product_area,
      sentiment: r.sentiment,
      urgency: r.urgency,
      business_impact: r.business_impact,
      created_at: r.created_at,
      similarity: r.similarity,
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function insertEmbedding(
  feedbackId: number,
  embedding: number[]
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('feedback')
      .update({ embedding })
      .eq('id', feedbackId);

    if (error) {
      console.error('Embedding insert error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Embedding insert error:', error);
    return false;
  }
}

export async function getUniqueValues(
  userId: string,
  field: 'source' | 'user_segment' | 'product_area'
): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select(field)
      .eq('owner_id', userId)
      .not(field, 'is', null);

    if (error) {
      console.error(`Get unique ${field} error:`, error);
      return [];
    }

    return Array.from(new Set(data.map(item => item[field as keyof typeof item])));
  } catch (error) {
    console.error(`Get unique ${field} error:`, error);
    return [];
  }
} 