// src/lib/env.ts
// Lazy env access. Never throw at import. Throw only when a getter is called at runtime.
type Maybe<T> = T | undefined;

const raw = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL as Maybe<string>,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as Maybe<string>,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY as Maybe<string>,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY as Maybe<string>,
  VERCEL_URL: process.env.VERCEL_URL as Maybe<string>,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL as Maybe<string>,
  NODE_ENV: (process.env.NODE_ENV as Maybe<"development" | "test" | "production">) ?? "development",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as Maybe<string>,
  STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID as Maybe<string>,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as Maybe<string>,
};

// Public App URL is safe to compute without throwing.
// Fallback value avoids build-time undefined without breaking runtime.
export const PUBLIC_APP_URL: string =
  raw.NEXT_PUBLIC_APP_URL ??
  (raw.VERCEL_URL ? `https://${raw.VERCEL_URL}` : "http://localhost:3000");

// Runtime assertions when you actually need required keys
export function getServerEnv() {
  const url = raw.NEXT_PUBLIC_SUPABASE_URL;
  const anon = raw.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return {
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
    SUPABASE_SERVICE_ROLE_KEY: raw.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: raw.OPENAI_API_KEY,
    NODE_ENV: raw.NODE_ENV,
    STRIPE_SECRET_KEY: raw.STRIPE_SECRET_KEY,
    STRIPE_PRICE_ID: raw.STRIPE_PRICE_ID,
    STRIPE_WEBHOOK_SECRET: raw.STRIPE_WEBHOOK_SECRET,
  };
} 