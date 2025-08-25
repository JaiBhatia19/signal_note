import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { supabaseServer } from '@/lib/supabase/server';
import { PUBLIC_APP_URL } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { priceId } = body;
    
    const supabase = supabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already has a Pro subscription (except for founding pass)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'pro' && priceId !== 'founding-pass') {
      return NextResponse.json({ error: "Already a Pro user" }, { status: 400 })
    }

    const stripe = getStripe();
    
    // Price ID mapping
    const priceMapping: Record<string, string> = {
      'founding-pass': process.env.STRIPE_FOUNDING_PASS_PRICE_ID || 'price_founding_pass',
      'pro-monthly': process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
    };

    const stripePriceId = priceMapping[priceId];
    if (!stripePriceId) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 })
    }

    // Determine mode based on price type
    const mode = priceId === 'founding-pass' ? 'payment' : 'subscription';
    
    const sessionConfig: any = {
      mode,
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        }
      ],
      success_url: `${PUBLIC_APP_URL}/settings?success=1&type=${priceId}`,
      cancel_url: `${PUBLIC_APP_URL}/pricing?canceled=1`,
      customer_email: user.email || undefined,
      metadata: {
        userId: user.id,
        userEmail: user.email || '',
        priceType: priceId,
      },
    };

    // Add subscription_data only for subscription mode
    if (mode === 'subscription') {
      sessionConfig.subscription_data = {
        metadata: {
          userId: user.id,
          userEmail: user.email || '',
          priceType: priceId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
} 