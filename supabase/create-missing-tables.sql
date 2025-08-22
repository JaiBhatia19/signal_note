-- Create missing tables for SignalNote app
-- Run this in your Supabase SQL Editor

-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id bigserial PRIMARY KEY,
    email text UNIQUE NOT NULL,
    ref_code text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on waitlist table
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for waitlist (allow public inserts)
CREATE POLICY "waitlist open insert" ON public.waitlist
    FOR INSERT WITH CHECK (true);

-- Create RLS policy for waitlist (allow public reads)
CREATE POLICY "waitlist open select" ON public.waitlist
    FOR SELECT USING (true);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id bigserial PRIMARY KEY,
    owner_id uuid REFERENCES public.profiles(id),
    name text NOT NULL,
    data jsonb,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for events (allow authenticated users to insert/read their own events)
CREATE POLICY "events user insert" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "events user select" ON public.events
    FOR SELECT USING (auth.uid() = owner_id);

-- Grant necessary permissions
GRANT ALL ON public.waitlist TO authenticated;
GRANT ALL ON public.waitlist TO anon;
GRANT ALL ON public.events TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_ref_code ON public.waitlist(ref_code);
CREATE INDEX IF NOT EXISTS idx_events_owner_id ON public.events(owner_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON public.events(name);

-- Verify tables were created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('waitlist', 'events')
ORDER BY table_name; 