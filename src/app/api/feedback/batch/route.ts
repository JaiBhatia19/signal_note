import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { analyzeAndEmbed } from '@/lib/openai';
import { insertEmbedding } from '@/lib/search';
import { getUser } from '@/lib/guards';
import { parse } from 'csv-parse';

export const runtime = "nodejs";

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

interface CSVRow {
  source?: string;
  user_segment?: string;
  product_area?: string;
  text: string;
  created_at?: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'CSV file is required' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV' },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    
    // Parse CSV
    const rows: CSVRow[] = await new Promise((resolve, reject) => {
      parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }, (err: any, records: any) => {
        if (err) reject(err);
        else resolve(records);
      });
    });

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'CSV contains no valid rows' },
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

      if (todayCount && todayCount + rows.length > 50) {
        return NextResponse.json(
          { error: `Daily feedback limit would be exceeded. You can add ${Math.max(0, 50 - todayCount)} more items today.` },
          { status: 429 }
        );
      }
    }

    // Validate required fields
    const invalidRows = rows.filter(row => !row.text || row.text.trim().length === 0);
    if (invalidRows.length > 0) {
      return NextResponse.json(
        { error: `${invalidRows.length} rows are missing required text field` },
        { status: 400 }
      );
    }

    // Insert feedback rows
    const feedbackToInsert = rows.map(row => ({
      owner_id: user.id,
      text: row.text.trim(),
      source: row.source || null,
      user_segment: row.user_segment || null,
      product_area: row.product_area || null,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    }));

    const { data: insertedFeedback, error: insertError } = await supabase
      .from('feedback')
      .insert(feedbackToInsert)
      .select('id, text');

    if (insertError) {
      console.error('Batch feedback insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to insert feedback' },
        { status: 500 }
      );
    }

    // Track event
    await supabase
      .from('events')
      .insert({
        owner_id: user.id,
        name: 'batch_feedback_uploaded',
        data: { count: rows.length, filename: file.name },
      });

    // Process analysis in background (don't block response)
    processBatchAnalysis(insertedFeedback, user.id);

    return NextResponse.json(
      { 
        message: `Successfully uploaded ${rows.length} feedback items`,
        feedback_ids: insertedFeedback.map(f => f.id),
        analysis_in_progress: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Batch feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Background processing function
async function processBatchAnalysis(feedbackItems: { id: number; text: string }[], userId: string) {
  try {
    for (const item of feedbackItems) {
      try {
        // Analyze and embed
        const { analysis, embedding } = await analyzeAndEmbed(item.text);
        
        // Update feedback with analysis
        await supabase
          .from('feedback')
          .update({
            analysis,
            sentiment: analysis.sentiment,
            urgency: analysis.urgency,
            business_impact: analysis.business_impact,
          })
          .eq('id', item.id);

        // Insert embedding
        await insertEmbedding(item.id, embedding);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (itemError) {
        console.error(`Error processing feedback ${item.id}:`, itemError);
        // Continue with next item
      }
    }

    // Track completion
    await supabase
      .from('events')
      .insert({
        owner_id: userId,
        name: 'batch_analysis_complete',
        data: { count: feedbackItems.length },
      });

  } catch (error) {
    console.error('Batch analysis error:', error);
  }
} 