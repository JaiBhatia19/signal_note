-- Enable pgvector
create extension if not exists vector;

-- Profiles table with role and referral tracking
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  name text,
  image text,
  role text default 'free',
  ref_code text unique,
  referred_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Waitlist for growth
create table public.waitlist (
  id bigserial primary key,
  email text unique not null,
  ref_code text,
  created_at timestamptz default now()
);

-- Referral tracking
create table public.referrals (
  id bigserial primary key,
  referrer_id uuid references public.profiles(id),
  referred_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Feedback table with AI analysis
create table public.feedback (
  id bigserial primary key,
  owner_id uuid not null references public.profiles(id),
  source text,
  user_segment text,
  product_area text,
  text text not null,
  created_at timestamptz default now(),
  analysis jsonb,
  sentiment numeric,
  urgency numeric,
  business_impact int,
  embedding vector(1536)
);

-- Clusters for pattern recognition
create table public.clusters (
  id bigserial primary key,
  owner_id uuid not null references public.profiles(id),
  label text,
  size int,
  centroid vector(1536),
  avg_sentiment numeric,
  avg_urgency numeric,
  feature_request text,
  action_items text,
  created_at timestamptz default now()
);

-- Events for analytics
create table public.events (
  id bigserial primary key,
  owner_id uuid references public.profiles(id),
  name text not null,
  data jsonb,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.waitlist enable row level security;
alter table public.referrals enable row level security;
alter table public.feedback enable row level security;
alter table public.clusters enable row level security;
alter table public.events enable row level security;

-- RLS Policies
create policy "own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "own rows feedback" on public.feedback
  using (owner_id = auth.uid());

create policy "own rows clusters" on public.clusters
  using (owner_id = auth.uid());

create policy "own rows events" on public.events
  using (owner_id = auth.uid());

create policy "waitlist open insert" on public.waitlist
  for insert with check (true);

create policy "waitlist read self" on public.waitlist
  for select using (true);

create policy "referrals read own" on public.referrals
  for select using (referrer_id = auth.uid() or referred_id = auth.uid());

-- Indexes for performance
create index on public.feedback (owner_id, created_at desc);
create index on public.feedback using ivfflat (embedding vector_cosine_ops);
create index on public.clusters (owner_id, created_at desc);

-- Upsert profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, ref_code)
  values (new.id, new.email, 'free', encode(gen_random_bytes(8), 'hex'))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

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
  source_distribution jsonb
)
language plpgsql as $$
begin
  return query
  select 
    count(*)::bigint as total_feedback,
    avg(f.sentiment) as avg_sentiment,
    avg(f.urgency) as avg_urgency,
    array_agg(distinct f.user_segment) filter (where f.user_segment is not null) as top_segments,
    array_agg(distinct f.product_area) filter (where f.product_area is not null) as top_areas,
    jsonb_object_agg(
      f.source, 
      count(*) filter (where f.source is not null)
    ) as source_distribution
  from feedback f
  where f.owner_id = search_user_id
    and f.created_at >= now() - interval '1 day' * days_back;
end;
$$; 