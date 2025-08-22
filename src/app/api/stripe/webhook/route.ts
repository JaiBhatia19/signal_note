import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { env } from '@/lib/env';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode === 'subscription' && session.subscription) {
    const userId = session.metadata?.user_id;
    if (userId) {
      // Update user role to pro
      await supabase
        .from('profiles')
        .update({ role: 'pro' })
        .eq('id', userId);

      // Track event
      await supabase
        .from('events')
        .insert({
          owner_id: userId,
          name: 'upgrade_pro',
          data: { 
            session_id: session.id,
            subscription_id: session.subscription,
            amount: session.amount_total,
          },
        });
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (userId && subscription.status === 'active') {
    await supabase
      .from('profiles')
      .update({ role: 'pro' })
      .eq('id', userId);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (userId) {
    const role = subscription.status === 'active' ? 'pro' : 'free';
    await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (userId) {
    await supabase
      .from('profiles')
      .update({ role: 'free' })
      .eq('id', userId);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription;
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
    const userId = subscription.metadata?.user_id;
    
    if (userId) {
      await supabase
        .from('profiles')
        .update({ role: 'pro' })
        .eq('id', userId);
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription;
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
    const userId = subscription.metadata?.user_id;
    
    if (userId) {
      // Keep pro status for now, but could implement grace period logic
      console.log(`Payment failed for user ${userId}, subscription ${subscriptionId}`);
    }
  }
} 