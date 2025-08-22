import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (request: NextRequest) => string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// In-memory store for rate limiting (in production, use Redis or similar)
const store: RateLimitStore = {};

export function createRateLimiter(config: RateLimitConfig) {
  return function rateLimit(request: NextRequest): RateLimitResult {
    const key = config.keyGenerator 
      ? config.keyGenerator(request) 
      : getClientIP(request);
    
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Clean up expired entries
    if (store[key] && store[key].resetTime < now) {
      delete store[key];
    }
    
    // Initialize or get current count
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + config.windowMs,
      };
    }
    
    // Check if limit exceeded
    if (store[key].count >= config.maxRequests) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: store[key].resetTime,
        retryAfter,
      };
    }
    
    // Increment count
    store[key].count++;
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - store[key].count,
      resetTime: store[key].resetTime,
    };
  };
}

function getClientIP(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a default key if no IP found
  return 'unknown';
}

// Pre-configured rate limiters
export const authRateLimit = createRateLimiter({
  maxRequests: 5, // 5 attempts
  windowMs: 15 * 60 * 1000, // 15 minutes
});

export const apiRateLimit = createRateLimiter({
  maxRequests: 100, // 100 requests
  windowMs: 60 * 1000, // 1 minute
});

export const searchRateLimit = createRateLimiter({
  maxRequests: 50, // 50 searches
  windowMs: 60 * 1000, // 1 minute
});

// Helper function to apply rate limiting to API routes
export function applyRateLimit(
  request: NextRequest,
  limiter: ReturnType<typeof createRateLimiter>
) {
  const result = limiter(request);
  
  if (!result.success) {
    const response = NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many requests, please try again later',
        retryAfter: result.retryAfter || 60, // Default to 60 seconds if undefined
      },
      { status: 429 }
    );
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
    response.headers.set('Retry-After', (result.retryAfter || 60).toString());
    
    return response;
  }
  
  return null; // No rate limit exceeded
} 