// Simple in-memory rate limiter
// For production, upgrade to Redis-based solution

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};
const CLEANUP_INTERVAL = 60000; // 1 minute

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, CLEANUP_INTERVAL);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (request: Request) => string; // Custom key generator
}

/**
 * Rate limit middleware for API routes
 * Usage: const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 10 })
 *        if (!limiter.check(req)) return new Response("Too many requests", { status: 429 })
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyGenerator } = config;

  return {
    check: (request: Request, identifier?: string): boolean => {
      const key =
        identifier ||
        keyGenerator?.(request) ||
        request.headers.get("x-forwarded-for") ||
        "unknown";

      const now = Date.now();
      const entry = store[key];

      if (!entry || entry.resetTime < now) {
        // New entry or expired
        store[key] = {
          count: 1,
          resetTime: now + windowMs,
        };
        return true;
      }

      if (entry.count < maxRequests) {
        entry.count++;
        return true;
      }

      return false;
    },

    getRemaining: (identifier: string): number => {
      const entry = store[identifier];
      if (!entry || entry.resetTime < Date.now()) {
        return 0;
      }
      return Math.max(0, 0 - entry.count);
    },

    reset: (identifier: string): void => {
      delete store[identifier];
    },
  };
}

// Pre-configured limiters for common endpoints
export const signupLimiter = createRateLimiter({
  windowMs: 3600000, // 1 hour
  maxRequests: 5, // 5 signups per hour per IP
});

export const loginLimiter = createRateLimiter({
  windowMs: 900000, // 15 minutes
  maxRequests: 10, // 10 login attempts per 15 min
});

export const apiLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100, // 100 requests per minute per IP
});

export const searchLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 50, // 50 searches per minute
});
