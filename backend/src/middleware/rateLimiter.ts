import rateLimit from "express-rate-limit";

/**
 * Strict rate limiter for Authentication routes (/login, /register)
 * Protects against brute-force password guessing and bot account generation.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 10 : 500, // Developer friendly in dev, strict in production
  standardHeaders: true, // Return standard RateLimit headers in response
  legacyHeaders: false,
  statusCode: 429,
  message: {
    success: false,
    message: "Too many authentication attempts from this IP address. Please try again after 15 minutes.",
    retryAfter: "15m",
  },
});

/**
 * Strict rate limiter for Checkout / Payment operations
 * Protects against credit card testing fraud and automated order spam.
 */
export const checkoutRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 25, // Limit each IP to 25 checkout creations per hour
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    success: false,
    message: "Checkout rate limit exceeded. Please wait a few minutes before submitting another order.",
    retryAfter: "1h",
  },
});

/**
 * Global rate limiter for public browsing API endpoints
 * Protects against scraping bots and denial of service.
 */
export const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // Generous 600 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    success: false,
    message: "Too many requests to the SmartElectronics API. Please slow down and try again later.",
  },
});

/**
 * Rate limiter for file uploads to prevent disk exhaustion attacks.
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 50 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    success: false,
    message: "Upload rate limit exceeded. Please wait before uploading more files.",
  },
});

