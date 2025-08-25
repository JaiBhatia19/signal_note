-- Create missing tables for SignalNote v1
-- This file adds the simplified schema needed for the core v1 features

-- Feedback items table (simplified from existing feedback table)
create table if not exists public.feedback_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  text text not null,
  source text,
  created_at timestamptz default now()
);

-- Analyses table for AI results
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.feedback_items(id) on delete cascade,
  sentiment_number integer,
  urgency_text text,
  theme_text text,
  action_text text,
  created_at timestamptz default now()
);

-- enable RLS
alter table public.feedback_items enable row level security;
alter table public.analyses enable row level security;

-- simple per-user isolation. adjust if you use Supabase auth.uid()
drop policy if exists "feedback_items_owner" on public.feedback_items;
create policy "feedback_items_owner" on public.feedback_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "analyses_owner" on public.analyses;
create policy "analyses_owner" on public.analyses
  for all using (exists(select 1 from public.feedback_items f where f.id = item_id and f.user_id = auth.uid()))
  with check (exists(select 1 from public.feedback_items f where f.id = item_id and f.user_id = auth.uid()));

-- Indexes for performance
create index if not exists idx_feedback_items_user_id on public.feedback_items(user_id, created_at desc);
create index if not exists idx_analyses_item_id on public.analyses(item_id);
create index if not exists idx_analyses_urgency on public.analyses(urgency_text);
create index if not exists idx_analyses_theme on public.analyses(theme_text);
create index if not exists idx_analyses_sentiment on public.analyses(sentiment_number);

-- Function to get themes summary
create or replace function get_themes_summary(search_user_id uuid)
returns table (
  theme text,
  count bigint,
  example_quotes text[]
)
language plpgsql as $$
begin
  return query
  select 
    a.theme_text as theme,
    count(*)::bigint as count,
    array_agg(fi.text order by fi.created_at desc limit 3) as example_quotes
  from public.analyses a
  join public.feedback_items fi on a.item_id = fi.id
  where fi.user_id = search_user_id
  group by a.theme_text
  order by count desc;
end;
$$; 