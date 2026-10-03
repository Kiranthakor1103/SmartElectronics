/**
 * Enterprise Dual-Layer Cache Manager for SmartElectronics Backend.
 * Seamlessly integrates Redis when REDIS_URL is configured (Docker / Production),
 * with an ultra-fast in-memory fallback so the server operates reliably in all environments.
 */

import Redis from "ioredis";

interface CacheEntry<T = any> {
  value: T;
  expiresAt: number; // Unix timestamp in milliseconds
}

class CacheManager {
  private memoryStore: Map<string, CacheEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private redisClient: Redis | null = null;
  private isRedisConnected: boolean = false;

  constructor() {
    this.initRedis();

    // Periodically sweep expired memory keys every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.evictExpiredMemory();
    }, 60 * 1000);

    if (this.cleanupInterval && typeof this.cleanupInterval.unref === "function") {
      this.cleanupInterval.unref();
    }
  }

  private initRedis(): void {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      return;
    }

    try {
      this.redisClient = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 2,
        retryStrategy: (times) => {
          if (times > 3) return null; // Stop retrying after 3 attempts in dev
          return Math.min(times * 100, 2000);
        },
      });

      this.redisClient.on("connect", () => {
        this.isRedisConnected = true;
        console.log(`⚡ [Redis] Connected successfully to ${redisUrl}`);
      });

      this.redisClient.on("error", (err) => {
        this.isRedisConnected = false;
        // Graceful log without crashing the application
        if (process.env.NODE_ENV !== "test") {
          console.warn(`⚠️ [Redis] Connection warning (${err.message}). Using in-memory fallback.`);
        }
      });

      this.redisClient.connect().catch(() => {
        this.isRedisConnected = false;
      });
    } catch {
      this.isRedisConnected = false;
    }
  }

  private evictExpiredMemory(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryStore.entries()) {
      if (entry.expiresAt <= now) {
        this.memoryStore.delete(key);
      }
    }
  }

  /**
   * Get an item from cache. Checks Redis first (if connected), else memory.
   */
  async get<T>(key: string): Promise<T | null> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        if (raw !== null) {
          return JSON.parse(raw) as T;
        }
      } catch {
        // Fallback to memory on Redis read failure
      }
    }

    const entry = this.memoryStore.get(key);
    if (!entry) return null;

    if (entry.expiresAt <= Date.now()) {
      this.memoryStore.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set an item in cache with a Time-To-Live in seconds (default: 300s = 5m).
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    // 1. Store in Memory
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.memoryStore.set(key, { value, expiresAt });

    // 2. Store in Redis if available
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
      } catch {
        // ignore
      }
    }
  }

  /**
   * Invalidate a specific key or all keys matching a prefix (e.g. "cache:/api/products*")
   */
  async del(pattern: string): Promise<void> {
    // 1. Invalidate memory keys
    if (pattern.endsWith("*")) {
      const prefix = pattern.slice(0, -1);
      for (const key of this.memoryStore.keys()) {
        if (key.startsWith(prefix)) {
          this.memoryStore.delete(key);
        }
      }
    } else {
      this.memoryStore.delete(pattern);
    }

    // 2. Invalidate Redis keys
    if (this.isRedisConnected && this.redisClient) {
      try {
        if (pattern.endsWith("*")) {
          const keys = await this.redisClient.keys(pattern);
          if (keys.length > 0) {
            await this.redisClient.del(...keys);
          }
        } else {
          await this.redisClient.del(pattern);
        }
      } catch {
        // ignore
      }
    }
  }

  /**
   * Clear the entire cache
   */
  async flush(): Promise<void> {
    this.memoryStore.clear();
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.flushdb();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Returns current count of in-memory cached items
   */
  size(): number {
    return this.memoryStore.size;
  }

  /**
   * Returns true if Redis is active
   */
  hasRedis(): boolean {
    return this.isRedisConnected;
  }
}

export const cacheManager = new CacheManager();
