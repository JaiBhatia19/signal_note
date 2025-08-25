import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { supabaseServer } from '@/lib/supabase/server';
import { createDemoAnalysis, simulateDelay } from '@/lib/demo';
import { isDemoMode } from '@/lib/env';

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (isDemoMode()) {
      await simulateDelay(2000);
      return NextResponse.json({
        success: true,
        message: 'CSV processed successfully in demo mode',
        processed: 15,
        analyzed: 15
      });
    }

    const supabase = supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();
    
    // Parse CSV
    let records;
    try {
      records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Invalid CSV format. Please check your file and try again.' 
      }, { status: 400 });
    }

    if (!records || records.length === 0) {
      return NextResponse.json({ 
        error: 'CSV file is empty or has no valid data rows' 
      }, { status: 400 });
    }

    // Validate required columns
    const requiredColumns = ['text'];
    const firstRecord = records[0];
    const headers = Object.keys(firstRecord);
    
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      return NextResponse.json({ 
        error: `Missing required columns: ${missingColumns.join(', ')}. Required: text` 
      }, { status: 400 });
    }

    // Validate and prepare data
    const validRecords = [];
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNum = i + 1;

      // Validate required fields
      if (!record.text || record.text.trim().length === 0) {
        errors.push(`Row ${rowNum}: 'text' field is required and cannot be empty`);
        continue;
      }

      if (record.text.length > 1000) {
        errors.push(`Row ${rowNum}: 'text' field must be 1000 characters or less`);
        continue;
      }

      // Prepare feedback item
      const feedbackItem = {
        text: record.text.trim(),
        source: record.source?.trim() || 'csv',
        user_segment: record.user_segment?.trim() || null,
        product_area: record.product_area?.trim() || null,
        created_at: record.created_at ? 
          new Date(record.created_at).toISOString() : 
          new Date().toISOString(),
        owner_id: user.id
      };

      validRecords.push(feedbackItem);
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation errors found',
        details: errors 
      }, { status: 400 });
    }

    // Limit batch size
    if (validRecords.length > 100) {
      return NextResponse.json({ 
        error: 'Too many records. Please limit to 100 items per upload.' 
      }, { status: 400 });
    }

    // Insert into database
    const { data, error } = await supabase
      .from('feedback')
      .insert(validRecords)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: 'Failed to save feedback to database' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'CSV processed successfully',
      processed: validRecords.length,
      analyzed: validRecords.length
    });

  } catch (error) {
    console.error('CSV processing error:', error);
    return NextResponse.json({ 
      error: 'Failed to process CSV file' 
    }, { status: 500 });
  }
}
