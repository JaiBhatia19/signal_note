import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/guards';
import Stripe from 'stripe';
import { env } from '@/lib/env';
import { createClient } from '@supabase/supabase-js';

export const runtime = "nodejs";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { success_url, cancel_url } = await request.json();

    if (!success_url || !cancel_url) {
      return NextResponse.json(
        { error: 'Success and cancel URLs are required' },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('stripe_subscription_id, stripe_customer_id, role')
      .eq('id', user.id)
      .single();

    if (existingProfile?.role === 'pro' && existingProfile?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'User already has an active Pro subscription' },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    let customerId = existingProfile?.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;

      // Update profile with customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
        trial_period_days: 7, // Optional: 7-day free trial
      },
      allow_promotion_codes: true, // Allow discount codes
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
    });

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (error) {
    console.error('Stripe checkout API error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 