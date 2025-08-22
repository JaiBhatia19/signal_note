import { NextResponse } from 'next/server'
import { validateEnv } from '@/lib/env'
import { getSupabaseServer } from '@/lib/supabase-server'
import OpenAI from 'openai'
import { stripe } from '@/lib/stripe'

export async function GET() {
  try {
    // Validate environment variables
    validateEnv()
    
    // Test Supabase connection
    const supabase = getSupabaseServer()
    const { error: supabaseError } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    
    // Test OpenAI connection
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    let openaiError = null
    try {
      await openai.models.list()
    } catch (err: any) {
      openaiError = err
    }
    
    // Test Stripe connection
    let stripeError = null
    try {
      await stripe.paymentMethods.list({ limit: 1 })
    } catch (err: any) {
      stripeError = err
    }
    
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        environment: 'ok',
        supabase: supabaseError ? 'error' : 'ok',
        openai: openaiError ? 'error' : 'ok',
        stripe: stripeError ? 'error' : 'ok'
      },
      errors: {
        supabase: supabaseError?.message,
        openai: openaiError?.message,
        stripe: stripeError?.message
      }
    }

    const hasErrors = Object.values(status.services).some(service => service === 'error')
    const statusCode = hasErrors ? 503 : 200

    return NextResponse.json(status, { status: statusCode })
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 })
  }
} 