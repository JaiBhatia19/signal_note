-- Enable pgvector
create extension if not exists vector;

-- Profiles table to store subscription flag
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  is_pro boolean default false,
  created_at timestamptz default now()
);

-- Feedback table with enhanced fields for advanced analysis
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  source text,
  content text,
  user_segment text,
  product_area text,
  priority text default 'medium',
  sentiment_score float,
  urgency_score float,
  ai_insights jsonb,
  created_at timestamptz default now(),
  embedding vector(1536)
);

create index if not exists feedback_embedding_idx
  on feedback using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Enhanced feature requests with impact scoring
create table if not exists feature_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text default 'open',
  impact_score float,
  effort_score float,
  roi_estimate float,
  affected_users text,
  business_value text,
  created_at timestamptz default now()
);

-- Feedback clusters for advanced insights
create table if not exists feedback_clusters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  theme text,
  sentiment_trend text,
  urgency_level text,
  affected_segments text[],
  affected_areas text[],
  feedback_count integer,
  created_at timestamptz default now()
);

-- Cluster feedback mapping
create table if not exists cluster_feedback (
  cluster_id uuid references feedback_clusters(id) on delete cascade,
  feedback_id uuid references feedback(id) on delete cascade,
  similarity_score float,
  primary key (cluster_id, feedback_id)
);

-- Feedback feature link
create table if not exists feedback_feature_link (
  feedback_id uuid references feedback(id) on delete cascade,
  feature_request_id uuid references feature_requests(id) on delete cascade,
  primary key (feedback_id, feature_request_id)
);

-- User segments for advanced analytics
create table if not exists user_segments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  criteria jsonb,
  created_at timestamptz default now()
);

-- Product areas for categorization
create table if not exists product_areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  parent_area text,
  created_at timestamptz default now()
);

-- Row level security
alter table profiles enable row level security;
alter table feedback enable row level security;
alter table feature_requests enable row level security;
alter table feedback_clusters enable row level security;
alter table cluster_feedback enable row level security;
alter table feedback_feature_link enable row level security;
alter table user_segments enable row level security;
alter table product_areas enable row level security;

create policy "profiles are self" on profiles
for select using (auth.uid() = id);

create policy "feedback is self" on feedback
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "features are self" on feature_requests
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "clusters are self" on feedback_clusters
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "cluster_feedback is self" on cluster_feedback
for all using (
  exists (select 1 from feedback_clusters fc where fc.id = cluster_id and fc.user_id = auth.uid())
) with check (
  exists (select 1 from feedback_clusters fc where fc.id = cluster_id and fc.user_id = auth.uid())
);

create policy "link is self" on feedback_feature_link
for all using (
  exists (select 1 from feedback f where f.id = feedback_id and f.user_id = auth.uid())
) with check (
  exists (select 1 from feedback f where f.id = feedback_id and f.user_id = auth.uid())
);

create policy "segments are self" on user_segments
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "areas are self" on product_areas
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Upsert profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, is_pro)
  values (new.id, new.email, false)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Enhanced search function for semantic similarity with filters
create or replace function match_feedback(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  search_user_id uuid,
  filter_source text default null,
  filter_segment text default null,
  filter_area text default null,
  filter_priority text default null
) returns table (
  id uuid,
  content text,
  source text,
  user_segment text,
  product_area text,
  priority text,
  sentiment_score float,
  urgency_score float,
  created_at timestamptz,
  similarity float
)
language plpgsql as $$
begin
  return query
  select f.id, f.content, f.source, f.user_segment, f.product_area, f.priority,
         f.sentiment_score, f.urgency_score, f.created_at,
         1 - (f.embedding <=> query_embedding) as similarity
  from feedback f
  where f.user_id = search_user_id
    and 1 - (f.embedding <=> query_embedding) > match_threshold
    and (filter_source is null or f.source = filter_source)
    and (filter_segment is null or f.user_segment = filter_segment)
    and (filter_area is null or f.product_area = filter_area)
    and (filter_priority is null or f.priority = filter_priority)
  order by f.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Function to get feedback analytics
create or replace function get_feedback_analytics(
  search_user_id uuid,
  days_back integer default 30
) returns table (
  total_feedback bigint,
  avg_sentiment float,
  avg_urgency float,
  top_segments text[],
  top_areas text[],
  priority_distribution jsonb
)
language plpgsql as $$
begin
  return query
  select 
    count(*)::bigint as total_feedback,
    avg(f.sentiment_score) as avg_sentiment,
    avg(f.urgency_score) as avg_urgency,
    array_agg(distinct f.user_segment) filter (where f.user_segment is not null) as top_segments,
    array_agg(distinct f.product_area) filter (where f.product_area is not null) as top_areas,
    jsonb_object_agg(
      f.priority, 
      count(*) filter (where f.priority is not null)
    ) as priority_distribution
  from feedback f
  where f.user_id = search_user_id
    and f.created_at >= now() - interval '1 day' * days_back;
end;
$$; 