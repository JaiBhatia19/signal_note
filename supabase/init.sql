-- Enable pgvector
create extension if not exists vector;

-- Profiles table to store subscription flag
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  is_pro boolean default false,
  created_at timestamptz default now()
);

-- Feedback table with embedding
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  source text,
  content text,
  created_at timestamptz default now(),
  embedding vector(1536)
);

create index if not exists feedback_embedding_idx
  on feedback using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Feature requests for simple tracking
create table if not exists feature_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists feedback_feature_link (
  feedback_id uuid references feedback(id) on delete cascade,
  feature_request_id uuid references feature_requests(id) on delete cascade,
  primary key (feedback_id, feature_request_id)
);

-- Row level security
alter table profiles enable row level security;
alter table feedback enable row level security;
alter table feature_requests enable row level security;
alter table feedback_feature_link enable row level security;

create policy "profiles are self" on profiles
for select using (auth.uid() = id);

create policy "feedback is self" on feedback
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "features are self" on feature_requests
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "link is self" on feedback_feature_link
for all using (
  exists (select 1 from feedback f where f.id = feedback_id and f.user_id = auth.uid())
) with check (
  exists (select 1 from feedback f where f.id = feedback_id and f.user_id = auth.uid())
);

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

-- Search function for semantic similarity
create or replace function match_feedback(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  search_user_id uuid
) returns table (
  id uuid,
  content text,
  source text,
  created_at timestamptz,
  similarity float
)
language plpgsql as $$
begin
  return query
  select f.id, f.content, f.source, f.created_at,
         1 - (f.embedding <=> query_embedding) as similarity
  from feedback f
  where f.user_id = search_user_id
    and 1 - (f.embedding <=> query_embedding) > match_threshold
  order by f.embedding <=> query_embedding
  limit match_count;
end;
$$; 