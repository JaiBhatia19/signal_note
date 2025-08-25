export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("analyses")
    .select("theme, feedback_items!inner(text)")
    .eq("feedback_items.user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const map = new Map<string, string[]>();
  for (const row of data ?? []) {
    const t = (row as any).theme ?? "General";
    const txt = (row as any).feedback_items?.text ?? "";
    const arr = map.get(t) ?? [];
    if (txt && arr.length < 2) arr.push(txt);
    map.set(t, arr);
  }
  const themes = Array.from(map.entries()).map(([theme, quotes]) => ({ theme, count: quotes.length, quotes }));
  return NextResponse.json({ themes });
} 