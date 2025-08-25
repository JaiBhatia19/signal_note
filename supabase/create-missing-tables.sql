-- Create missing tables for SignalNote v1
-- This file adds the simplified schema needed for the core v1 features

-- Feedback items table (simplified from existing feedback table)
create table if not exists public.feedback_items (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  source text,
  created_at timestamptz default now()
);

-- Analyses table for AI results
create table if not exists public.analyses (
  id bigserial primary key,
  item_id bigint not null references public.feedback_items(id) on delete cascade,
  sentiment_number integer not null check (sentiment_number >= 0 and sentiment_number <= 100),
  urgency_text text not null check (urgency_text in ('low', 'medium', 'high')),
  theme_text text not null,
  action_text text not null,
  created_at timestamptz default now()
);

-- Enable RLS on new tables
alter table public.feedback_items enable row level security;
alter table public.analyses enable row level security;

-- RLS Policies for feedback_items
create policy "users can view own feedback items" on public.feedback_items
  for select using (auth.uid() = user_id);

create policy "users can insert own feedback items" on public.feedback_items
  for insert with check (auth.uid() = user_id);

create policy "users can delete own feedback items" on public.feedback_items
  for delete using (auth.uid() = user_id);

-- RLS Policies for analyses
create policy "users can view own analyses" on public.analyses
  for select using (
    exists (
      select 1 from public.feedback_items 
      where id = item_id and user_id = auth.uid()
    )
  );

create policy "users can insert own analyses" on public.analyses
  for insert with check (
    exists (
      select 1 from public.feedback_items 
      where id = item_id and user_id = auth.uid()
    )
  );

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