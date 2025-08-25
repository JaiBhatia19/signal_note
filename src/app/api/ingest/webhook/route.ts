import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { createDemoAnalysis, simulateDelay } from '@/lib/demo';
import { isDemoMode } from '@/lib/env';

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Validate authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // In demo mode, accept any token that starts with 'demo_'
    if (isDemoMode()) {
      if (!token.startsWith('demo_')) {
        return NextResponse.json({ error: 'Invalid token for demo mode' }, { status: 401 });
      }
      
      // Simulate processing delay
      await simulateDelay(1000);
      
      return NextResponse.json({
        success: true,
        message: 'Webhook received and processed in demo mode',
        id: `demo_${Date.now()}`
      });
    }

    // In production, validate token against user's webhook tokens
    // For now, we'll use a simple validation
    if (!token || token.length < 10) {
      return NextResponse.json({ error: 'Invalid authorization token' }, { status: 401 });
    }

    const body = await request.json();
    const { text, source, user_segment, product_area, created_at } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Missing required field: text' 
      }, { status: 400 });
    }

    // For now, we'll create feedback without user authentication for webhook
    // In production, you'd want to map tokens to users
    const supabase = supabaseServer();
    
    // Create a system user or use a service account for webhook submissions
    const feedbackData = {
      text: text.trim(),
      source: source || 'webhook',
      user_segment: user_segment || null,
      product_area: product_area || null,
      created_at: created_at ? new Date(created_at).toISOString() : new Date().toISOString(),
      // For webhook submissions, we'll need a system approach to user association
      owner_id: '00000000-0000-0000-0000-000000000000' // placeholder - implement proper user mapping
    };

    const { data, error } = await supabase
      .from('feedback')
      .insert([feedbackData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: 'Failed to store feedback' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback received and queued for analysis',
      id: data.id
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Support GET request to test webhook endpoint
export async function GET() {
  return NextResponse.json({
    message: 'SignalNote Webhook Endpoint',
    version: '1.0',
    demo_mode: isDemoMode(),
    methods: ['POST'],
    required_headers: ['Authorization: Bearer <token>'],
    required_fields: ['text'],
    optional_fields: ['source', 'user_segment', 'product_area', 'created_at'],
    example: {
      text: 'Customer feedback here',
      source: 'typeform',
      user_segment: 'enterprise',
      product_area: 'dashboard'
    }
  });
}
