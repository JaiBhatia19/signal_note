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
      console.error('Missing stripe signature in webhook');
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

    console.log(`Processing webhook event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      
      case 'customer.subscription.created':
        const subscriptionCreated = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscriptionCreated);
        break;
      
      case 'customer.subscription.updated':
        const subscriptionUpdated = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscriptionUpdated);
        break;
      
      case 'customer.subscription.deleted':
        const subscriptionDeleted = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscriptionDeleted);
        break;
      
      case 'invoice.payment_succeeded':
        const invoiceSucceeded = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoiceSucceeded);
        break;
      
      case 'invoice.payment_failed':
        const invoiceFailed = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoiceFailed);
        break;

      case 'customer.subscription.trial_will_end':
        const trialEnding = event.data.object as Stripe.Subscription;
        await handleTrialEnding(trialEnding);
        break;

      case 'customer.subscription.paused':
        const subscriptionPaused = event.data.object as Stripe.Subscription;
        await handleSubscriptionPaused(subscriptionPaused);
        break;

      case 'customer.subscription.resumed':
        const subscriptionResumed = event.data.object as Stripe.Subscription;
        await handleSubscriptionResumed(subscriptionResumed);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode === 'subscription' && session.subscription) {
    const userId = session.metadata?.user_id;
    if (userId) {
      try {
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        // Update user profile with subscription details
        const { error } = await supabase
          .from('profiles')
          .update({ 
            role: 'pro',
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string
          })
          .eq('id', userId);
        
        if (error) {
          console.error('Failed to update user profile on checkout completion:', error);
        } else {
          console.log(`User ${userId} upgraded to Pro with subscription ${subscription.id}`);
        }
      } catch (err) {
        console.error('Error handling checkout completion:', err);
      }
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (userId && subscription.status === 'active') {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: 'pro',
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Failed to update user role on subscription creation:', error);
      } else {
        console.log(`User ${userId} subscription created: ${subscription.id}`);
      }
    } catch (err) {
      console.error('Error handling subscription creation:', err);
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (userId) {
    try {
      let role = 'free';
      if (['active', 'trialing'].includes(subscription.status)) {
        role = 'pro';
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Failed to update user role on subscription update:', error);
      } else {
        console.log(`User ${userId} subscription updated: ${subscription.id} - Status: ${subscription.status}`);
      }
    } catch (err) {
      console.error('Error handling subscription update:', err);
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (userId) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: 'free',
          stripe_subscription_id: null
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Failed to update user role on subscription deletion:', error);
      } else {
        console.log(`User ${userId} subscription cancelled: ${subscription.id}`);
      }
    } catch (err) {
      console.error('Error handling subscription deletion:', err);
    }
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    try {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      const userId = subscription.metadata?.user_id;
      
      if (userId) {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            role: 'pro',
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string
          })
          .eq('id', userId);
        
        if (error) {
          console.error('Failed to update user role on successful payment:', error);
        } else {
          console.log(`User ${userId} payment succeeded for subscription ${subscription.id}`);
        }
      }
    } catch (err) {
      console.error('Error handling successful payment:', err);
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    try {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      const userId = subscription.metadata?.user_id;
      
      if (userId) {
        // Keep user as pro for now, but could implement grace period logic
        console.log(`Payment failed for user ${userId}, subscription: ${invoice.subscription}`);
        
        // Optionally send email notification to user about payment failure
        // This could be implemented with a separate email service
      }
    } catch (err) {
      console.error('Error handling failed payment:', err);
    }
  }
}

async function handleTrialEnding(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (userId) {
    console.log(`Trial ending for user ${userId}, subscription: ${subscription.id}`);
    // Could implement email notification about trial ending
  }
}

async function handleSubscriptionPaused(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (userId) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'free' })
        .eq('id', userId);
      
      if (error) {
        console.error('Failed to update user role on subscription pause:', error);
      } else {
        console.log(`User ${userId} subscription paused: ${subscription.id}`);
      }
    } catch (err) {
      console.error('Error handling subscription pause:', err);
    }
  }
}

async function handleSubscriptionResumed(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (userId) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'pro' })
        .eq('id', userId);
      
      if (error) {
        console.error('Failed to update user role on subscription resume:', error);
      } else {
        console.log(`User ${userId} subscription resumed: ${subscription.id}`);
      }
    } catch (err) {
      console.error('Error handling subscription resume:', err);
    }
  }
} 