// src/lib/supabase.ts
export { supabaseServer } from "@/lib/supabase/server";
export { supabaseBrowser } from "@/lib/supabase/client";
type Handler = (req: Request) => Promise<Response> | Response;
type RouteMap = Partial<Record<"GET"|"POST"|"PUT"|"PATCH"|"DELETE"|"OPTIONS", Handler>>;
export function createRoute(arg: Handler | RouteMap) { return arg; } 