export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = supabaseServer();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    // Get themes with counts and sample quotes for the authenticated user
    const { data: themes, error } = await supabase
      .from("analyses")
      .select(`
        theme_text,
        feedback_items!inner(
          text,
          created_at
        )
      `)
      .eq('feedback_items.user_id', user.id);
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    // Group by theme and get counts + sample quotes
    const themeMap = new Map<string, { count: number; quotes: string[] }>();
    
    themes?.forEach((item: any) => {
      const theme = item.theme_text || 'General';
      if (!themeMap.has(theme)) {
        themeMap.set(theme, { count: 0, quotes: [] });
      }
      const themeData = themeMap.get(theme)!;
      themeData.count++;
      // Keep up to 2 recent quotes per theme
      if (themeData.quotes.length < 2) {
        themeData.quotes.push(item.feedback_items.text);
      }
    });
    
    const result = Array.from(themeMap.entries()).map(([theme, data]) => ({
      theme,
      count: data.count,
      sample_quotes: data.quotes
    }));
    
    return NextResponse.json({ themes: result });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch themes" },
      { status: 500 }
    );
  }
} 