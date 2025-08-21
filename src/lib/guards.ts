import { getSupabaseServer } from "./supabase-server"

export async function requireUser() {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("unauthorized")
  return user
}

export async function requirePro() {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("unauthorized")
  const { data: profile } = await supabase.from("profiles").select("is_pro").eq("id", user.id).single()
  if (!profile?.is_pro) throw new Error("payment_required")
  return user
} 