import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get("stripe-signature")!
  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  if (event.type === "checkout.session.completed" || event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const email = (event.data.object as any).customer_email || (event.data.object as any).customer_details?.email
    if (email) {
      await supabase.from("profiles").update({ is_pro: true }).eq("email", email)
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const email = (event.data.object as any).customer_email
    if (email) {
      await supabase.from("profiles").update({ is_pro: false }).eq("email", email)
    }
  }

  return NextResponse.json({ received: true })
}

export const dynamic = 'force-dynamic' 