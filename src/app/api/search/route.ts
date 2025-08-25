import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/guards';
import { searchFeedback, SearchFilters } from '@/lib/search';

export const runtime = "nodejs";

import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const source = searchParams.get('source');
    const user_segment = searchParams.get('user_segment');
    const product_area = searchParams.get('product_area');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    const min_similarity = searchParams.get('min_similarity');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Build filters
    const filters: SearchFilters = {};
    if (source) filters.source = source;
    if (user_segment) filters.user_segment = user_segment;
    if (product_area) filters.product_area = product_area;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;
    if (min_similarity) filters.min_similarity = parseFloat(min_similarity);

    // Perform search
    const results = await searchFeedback(query.trim(), user.id, filters, limit);

    return NextResponse.json({
      query: query.trim(),
      results,
      total: results.length,
      filters,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 