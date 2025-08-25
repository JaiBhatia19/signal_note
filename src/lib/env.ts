// src/lib/env.ts
type Maybe<T> = T | undefined;

const raw = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL as Maybe<string>,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as Maybe<string>,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY as Maybe<string>,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY as Maybe<string>,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL as Maybe<string>,
  VERCEL_URL: process.env.VERCEL_URL as Maybe<string>,
  NODE_ENV: (process.env.NODE_ENV as Maybe<"development" | "test" | "production">) ?? "development",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as Maybe<string>,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as Maybe<string>,
  DEMO_MODE: process.env.DEMO_MODE === 'true',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as Maybe<string>,
};

export const PUBLIC_APP_URL: string =
  raw.NEXT_PUBLIC_APP_URL ?? (raw.VERCEL_URL ? `https://${raw.VERCEL_URL}` : "http://localhost:3000");

export function getServerEnv() {
  const url = raw.NEXT_PUBLIC_SUPABASE_URL;
  const anon = raw.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // In demo mode, we don't require Supabase credentials
  if (!raw.DEMO_MODE && (!url || !anon)) {
    throw new Error("Missing Supabase public URL or anon key");
  }
  
  return {
    NEXT_PUBLIC_SUPABASE_URL: url || 'https://demo.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anon || 'demo_anon_key',
    SUPABASE_SERVICE_ROLE_KEY: raw.SUPABASE_SERVICE_ROLE_KEY || 'demo_service_key',
    OPENAI_API_KEY: raw.OPENAI_API_KEY,
    NODE_ENV: raw.NODE_ENV,
    STRIPE_SECRET_KEY: raw.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: raw.STRIPE_WEBHOOK_SECRET,
    DEMO_MODE: raw.DEMO_MODE,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: raw.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };
}

export const isDemoMode = () => raw.DEMO_MODE; 