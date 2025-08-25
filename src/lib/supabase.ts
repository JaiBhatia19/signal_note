// src/lib/supabase.ts
export { supabaseServer } from "@/lib/supabase/server";
export { supabaseBrowser } from "@/lib/supabase/client";

// Backward-compat shim for legacy code that expects `createRoute`
// Supports either a single handler or a map of HTTP verb handlers.
type Handler = (req: Request) => Promise<Response> | Response;
type RouteMap = Partial<Record<"GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS", Handler>>;

export function createRoute(handler: Handler): Handler;
export function createRoute(routes: RouteMap): RouteMap;
export function createRoute(arg: Handler | RouteMap): Handler | RouteMap {
  return arg; // pass-through; Next.js route handlers are exported as-is
} 