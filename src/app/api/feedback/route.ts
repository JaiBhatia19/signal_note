import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { analyzeAndEmbed, hashText } from '@/lib/openai';
import { insertEmbedding } from '@/lib/search';
import { getUser } from '@/lib/guards';

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { text, source, user_segment, product_area } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Feedback text is required' },
        { status: 400 }
      );
    }

    // Check daily limit for beta
    if (env.BETA_FEATURES) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: todayCount } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .gte('created_at', today.toISOString());

      if (todayCount && todayCount >= 50) {
        return NextResponse.json(
          { error: 'Daily feedback limit reached (50). Please upgrade to Pro for unlimited feedback.' },
          { status: 429 }
        );
      }
    }

    // Create feedback record
    const { data: feedback, error: insertError } = await supabase
      .from('feedback')
      .insert({
        owner_id: user.id,
        text: text.trim(),
        source: source || null,
        user_segment: user_segment || null,
        product_area: product_area || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Feedback insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create feedback' },
        { status: 500 }
      );
    }

    // Track event
    await supabase
      .from('events')
      .insert({
        owner_id: user.id,
        name: 'feedback_submitted',
        data: { feedback_id: feedback.id, source, user_segment, product_area },
      });

    // Run AI analysis in background
    try {
      const { analysis, embedding } = await analyzeAndEmbed(text);
      
      // Update feedback with analysis results
      await supabase
        .from('feedback')
        .update({
          analysis,
          sentiment: analysis.sentiment,
          urgency: analysis.urgency,
          business_impact: analysis.business_impact,
        })
        .eq('id', feedback.id);

      // Insert embedding
      await insertEmbedding(feedback.id, embedding);

      // Track successful analysis
      await supabase
        .from('events')
        .insert({
          owner_id: user.id,
          name: 'analysis_complete',
          data: { feedback_id: feedback.id, analysis },
        });

    } catch (analysisError) {
      console.error('AI analysis error:', analysisError);
      // Don't fail the request if analysis fails
    }

    return NextResponse.json(
      { 
        message: 'Feedback created successfully',
        feedback_id: feedback.id,
        analysis_complete: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: feedback, error } = await supabase
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
        analysis,
        created_at
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Feedback fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ feedback: feedback || [] });
  } catch (error) {
    console.error('Feedback GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 