import { Duration, Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { Request, Response, NextFunction } from "express";
import { env } from "./env.js";

// Create a Redis connection (serverless compatible)
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Configure rate limiter — e.g., 50 requests per minute per IP
export function createRateLimiter(
  maxRequests = 50,
  duration: Duration = "1 m"
) {
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, duration),
    analytics: true,
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "unknown";

      const { success, limit, remaining, reset } = await limiter.limit(ip);

      res.setHeader("X-RateLimit-Limit", limit.toString());
      res.setHeader("X-RateLimit-Remaining", remaining.toString());
      res.setHeader("X-RateLimit-Reset", reset.toString());

      if (!success) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
        });
      }

      next();
    } catch (error) {
      // Rate limiter failed - log but don't block requests in development
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Rate limiter unavailable, allowing request:",
          (error as Error).message
        );
      } else {
        console.error("Rate limiter error:", error);
      }
      // Continue without rate limiting if Redis is unavailable
      next();
    }
  };
}
