import { NextResponse } from "next/server";
export const runtime = "nodejs";

import { supabaseServer } from "@/lib/supabase/server";
import { getOpenAI } from "@/lib/ai/openai";

type FeedbackRow = { id?: string; text: string; source?: string };

function parseCsv(text: string): FeedbackRow[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines.shift()?.split(",").map(h => h.trim().toLowerCase()) ?? [];
  const textIdx = headers.findIndex(h => ["text","feedback","comment"].includes(h));
  if (textIdx === -1) throw new Error("CSV must contain a 'text' or 'feedback' column");
  return lines.slice(0, 200).map(l => {
    const cols = l.split(",");
    return { text: cols[textIdx] ?? "" };
  }).filter(r => r.text.trim().length > 0);
}

async function analyze(text: string) {
  const openai = getOpenAI();
  if (!openai) {
    // deterministic fallback
    const sentiment = text.match(/good|love|great|amazing|awesome/i) ? 0.8 :
                      text.match(/bad|hate|terrible|awful|bug|crash/i) ? 0.2 : 0.5;
    const urgency = text.match(/crash|down|payment|urgent|blocked/i) ? 0.8 : 0.3;
    const theme = text.match(/price|cost/i) ? "Pricing" :
                  text.match(/bug|error|crash/i) ? "Stability" :
                  text.match(/slow|performance/i) ? "Performance" : "General";
    return { sentiment, urgency, theme, actions: [] as string[] };
  }
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You label feedback with sentiment 0-1, urgency 0-1, a short theme, and 0-3 crisp action items." },
      { role: "user", content: text }
    ],
    temperature: 0
  });
  const content = res.choices[0]?.message?.content ?? "";
  // simple parse to keep v1 robust
  // Extract numbers and a theme keyword. If parsing fails, return fallback.
  const matchSent = content.match(/sentiment[^0-9]*([01](?:\.\d+)?)/i);
  const matchUrg  = content.match(/urgency[^0-9]*([01](?:\.\d+)?)/i);
  const matchTheme= content.match(/theme[^:]*:\s*([A-Za-z ]+)/i);
  const sentiment = matchSent ? parseFloat(matchSent[1]) : 0.5;
  const urgency  = matchUrg ? parseFloat(matchUrg[1]) : 0.3;
  const theme    = matchTheme ? matchTheme[1].trim() : "General";
  return { sentiment, urgency, theme, actions: [] as string[] };
}

export async function POST(req: Request) {
  try {
    const supabase = supabaseServer();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

    const csvText = await file.text();
    const rows = parseCsv(csvText);

    // hard limit for v1 to avoid timeouts
    const limited = rows.slice(0, 5);

    const inserted = [];

    for (const row of limited) {
      const { data: fb, error: e1 } = await supabase
        .from("feedback_items")
        .insert({ 
          text: row.text, 
          user_id: user.id,
          source: row.source || 'upload'
        })
        .select()
        .single();
      if (e1) throw e1;

      const a = await analyze(row.text);

      const { error: e2 } = await supabase.from("analyses").insert({
        item_id: fb.id,
        sentiment_number: Math.round(a.sentiment * 100),
        urgency_text: a.urgency > 0.7 ? 'high' : a.urgency > 0.4 ? 'medium' : 'low',
        theme_text: a.theme,
        action_text: a.actions[0] || 'Review feedback'
      });
      if (e2) throw e2;

      inserted.push({ feedback_id: fb.id });
    }

    return NextResponse.json({ ok: true, count: inserted.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 500 });
  }
} 