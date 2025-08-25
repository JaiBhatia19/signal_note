import { NextResponse } from 'next/server';
export const runtime = "nodejs";

import { supabaseServer } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = supabaseServer();
    
    // Try to access different tables to see which ones work
    const results: any = {};
    
    // Test feedback_items table
    try {
      const { data, error } = await supabase
        .from('feedback_items')
        .select('count')
        .limit(1);
      
      if (error) {
        results.feedback_items = { error: error.message };
      } else {
        results.feedback_items = { success: true, count: data?.length || 0 };
      }
    } catch (e: any) {
      results.feedback_items = { error: e.message };
    }
    
    // Test analyses table
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('count')
        .limit(1);
      
      if (error) {
        results.analyses = { error: error.message };
      } else {
        results.analyses = { success: true, count: data?.length || 0 };
      }
    } catch (e: any) {
      results.analyses = { error: e.message };
    }
    
    // Test auth.users table (if accessible)
    try {
      const { data, error } = await supabase
        .from('auth.users')
        .select('count')
        .limit(1);
      
      if (error) {
        results.auth_users = { error: error.message };
      } else {
        results.auth_users = { success: true, count: data?.length || 0 };
      }
    } catch (e: any) {
      results.auth_users = { error: e.message };
    }
    
    // Test profiles table (if it exists)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        results.profiles = { error: error.message };
      } else {
        results.profiles = { success: true, count: data?.length || 0 };
      }
    } catch (e: any) {
      results.profiles = { error: e.message };
    }
    
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 