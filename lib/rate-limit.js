import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

/**
 * Pre-configured rate limiters for different route types.
 * Each uses a sliding window algorithm.
 */
export const limiters = {
  /** Auth routes: 3 requests per minute */
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 m'),
    prefix: 'rl:auth',
  }),

  /** Login-adjacent routes: 5 requests per minute */
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'rl:login',
  }),

  /** Messaging: 20 requests per minute */
  messages: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    prefix: 'rl:messages',
  }),

  /** Bookings: 10 requests per minute */
  bookings: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'rl:bookings',
  }),

  /** Contact form: 3 requests per minute */
  contact: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 m'),
    prefix: 'rl:contact',
  }),

  /** AI planner: 5 requests per minute */
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'rl:ai',
  }),
}

/**
 * Get the client IP from request headers.
 */
function getIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Apply rate limiting to a request.
 * Returns null if allowed, or a 429 NextResponse if rate limited.
 *
 * Usage:
 *   const limited = await rateLimit(request, limiters.auth)
 *   if (limited) return limited
 */
export async function rateLimit(request, limiter) {
  // Skip rate limiting if Upstash is not configured (dev environment)
  if (!process.env.UPSTASH_REDIS_REST_URL) return null

  const ip = getIp(request)
  const { success, remaining, reset } = await limiter.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    )
  }

  return null
}
