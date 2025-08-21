import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function POST() {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=1`,
    customer_email: user.email || undefined
  })
  return NextResponse.json({ url: session.url })
} 