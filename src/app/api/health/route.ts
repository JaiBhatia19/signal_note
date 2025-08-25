import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import OpenAI from 'openai';

export const runtime = "nodejs";

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: ServiceHealth;
    openai: ServiceHealth;
    stripe: ServiceHealth;
    supabase: ServiceHealth;
  };
  system: {
    memory: NodeJS.MemoryUsage;
    platform: string;
    nodeVersion: string;
  };
}

interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  error?: string;
  details?: any;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    services: {
      database: { status: 'unhealthy', responseTime: 0 },
      openai: { status: 'unhealthy', responseTime: 0 },
      stripe: { status: 'unhealthy', responseTime: 0 },
      supabase: { status: 'unhealthy', responseTime: 0 },
    },
    system: {
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    },
  };

  // Check database health
  try {
    const dbStart = Date.now();
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    const dbResponseTime = Date.now() - dbStart;
    
    if (error) {
      healthStatus.services.database = {
        status: 'unhealthy',
        responseTime: dbResponseTime,
        error: error.message,
      };
    } else {
      healthStatus.services.database = {
        status: 'healthy',
        responseTime: dbResponseTime,
        details: { recordCount: data?.length || 0 },
      };
    }
  } catch (error) {
    healthStatus.services.database = {
      status: 'unhealthy',
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Check OpenAI health
  try {
    const openaiStart = Date.now();
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    
    // Simple test call to check API connectivity
    const response = await openai.models.list();
    const openaiResponseTime = Date.now() - openaiStart;
    
    healthStatus.services.openai = {
      status: 'healthy',
      responseTime: openaiResponseTime,
      details: { availableModels: response.data.length },
    };
  } catch (error) {
    healthStatus.services.openai = {
      status: 'unhealthy',
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Check Stripe health (basic connectivity)
  try {
    const stripeStart = Date.now();
    const stripe = require('stripe')(env.STRIPE_SECRET_KEY);
    
    // Test Stripe API connectivity
    await stripe.paymentMethods.list({ limit: 1 });
    const stripeResponseTime = Date.now() - stripeStart;
    
    healthStatus.services.stripe = {
      status: 'healthy',
      responseTime: stripeResponseTime,
      details: { apiVersion: '2023-10-16' },
    };
  } catch (error) {
    healthStatus.services.stripe = {
      status: 'unhealthy',
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Check Supabase Auth health
  try {
    const supabaseStart = Date.now();
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Test auth service
    const { data, error } = await supabase.auth.getSession();
    const supabaseResponseTime = Date.now() - supabaseStart;
    
    if (error) {
      healthStatus.services.supabase = {
        status: 'degraded',
        responseTime: supabaseResponseTime,
        error: error.message,
      };
    } else {
      healthStatus.services.supabase = {
        status: 'healthy',
        responseTime: supabaseResponseTime,
        details: { authService: 'operational' },
      };
    }
  } catch (error) {
    healthStatus.services.supabase = {
      status: 'unhealthy',
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Determine overall health status
  const unhealthyServices = Object.values(healthStatus.services).filter(
    service => service.status === 'unhealthy'
  ).length;
  
  const degradedServices = Object.values(healthStatus.services).filter(
    service => service.status === 'degraded'
  ).length;

  if (unhealthyServices > 0) {
    healthStatus.status = 'unhealthy';
  } else if (degradedServices > 0) {
    healthStatus.status = 'degraded';
  }

  // Add response time
  const totalResponseTime = Date.now() - startTime;

  // Set appropriate HTTP status code
  let statusCode = 200;
  if (healthStatus.status === 'unhealthy') {
    statusCode = 503; // Service Unavailable
  } else if (healthStatus.status === 'degraded') {
    statusCode = 200; // OK but with warnings
  }

  const response = NextResponse.json(healthStatus, { status: statusCode });
  
  // Add health check headers
  response.headers.set('X-Health-Status', healthStatus.status);
  response.headers.set('X-Response-Time', totalResponseTime.toString());
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  return response;
}

// Detailed health check for monitoring systems
export async function POST(request: NextRequest) {
  try {
    const { detailed = false } = await request.json();
    
    if (detailed) {
      // Return detailed health information including performance metrics
      const detailedHealth = await getDetailedHealth();
      return NextResponse.json(detailedHealth);
    }
    
    // Return basic health check
    return GET(request);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid health check request' },
      { status: 400 }
    );
  }
}

async function getDetailedHealth() {
  const startTime = Date.now();
  
  // Collect detailed system metrics
  const detailedHealth = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    platform: process.platform,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    services: {} as any,
  };

  // Add service-specific detailed checks here
  // This could include database connection pool status,
  // cache hit rates, queue depths, etc.
  
  return {
    ...detailedHealth,
    responseTime: Date.now() - startTime,
  };
} 