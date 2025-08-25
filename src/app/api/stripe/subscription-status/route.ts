import { NextResponse } from 'next/server';
export const runtime = "nodejs";

import { supabaseServer } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    // Get customer's subscriptions
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    })

    if (customers.data.length === 0) {
      return NextResponse.json({ 
        hasSubscription: false, 
        status: 'none' 
      })
    }

    const customer = customers.data[0]
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 1
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ 
        hasSubscription: false, 
        status: 'none' 
      })
    }

    const subscription = subscriptions.data[0]
    
    return NextResponse.json({
      hasSubscription: true,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    })
  } catch (error: any) {
    console.error('Subscription status error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 