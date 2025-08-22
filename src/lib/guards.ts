import { getSupabaseServer } from "./supabase-server"

export async function getUser() {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireUser() {
  const user = await getUser()
  if (!user) throw new Error("unauthorized")
  return user
}

export async function requirePro() {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("unauthorized")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== 'pro') throw new Error("payment_required")
  return user
} 