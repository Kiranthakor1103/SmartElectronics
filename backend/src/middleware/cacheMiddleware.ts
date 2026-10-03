import { Request, Response, NextFunction } from "express";
import { cacheManager } from "../utils/cacheManager";

/**
 * Express Middleware for Caching High-Read JSON endpoints.
 * @param ttlSeconds - Cache TTL in seconds (default: 300s = 5 minutes)
 */
export const cacheResponse = (ttlSeconds: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Allow clients/admins to bypass cache with standard headers
    const cacheControl = req.headers["cache-control"];
    if (cacheControl && cacheControl.includes("no-cache")) {
      res.setHeader("X-Cache", "BYPASS");
      return next();
    }

    const cacheKey = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedPayload = await cacheManager.get<any>(cacheKey);

      if (cachedPayload !== null) {
        res.setHeader("X-Cache", "HIT");
        res.setHeader("X-Cache-TTL", `${ttlSeconds}s`);
        return res.status(200).json(cachedPayload);
      }

      // Cache Miss: intercept res.json to store response in cache before sending
      res.setHeader("X-Cache", "MISS");

      const originalJson = res.json.bind(res);

      res.json = (body: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300 && body?.success) {
          cacheManager.set(cacheKey, body, ttlSeconds).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      // Graceful fallback to normal database execution if cache fails
      next();
    }
  };
};

/**
 * Helper to invalidate cached endpoints by prefix (e.g. invalidateCache("cache:/api/products*"))
 */
export const invalidateCache = async (pattern: string) => {
  try {
    await cacheManager.del(pattern);
  } catch {
    // ignore
  }
};
