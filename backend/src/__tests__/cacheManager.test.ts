import { cacheManager } from "../utils/cacheManager";

describe("CacheManager - In-Memory TTL & Prefix Eviction", () => {
  beforeEach(async () => {
    await cacheManager.flush();
  });

  afterAll(async () => {
    await cacheManager.flush();
  });

  it("should store and retrieve data within TTL window", async () => {
    const key = "cache:/api/products?page=1";
    const data = { success: true, count: 2, items: ["Product A", "Product B"] };

    await cacheManager.set(key, data, 60);
    const retrieved = await cacheManager.get(key);

    expect(retrieved).toEqual(data);
  });

  it("should return null when key does not exist", async () => {
    const retrieved = await cacheManager.get("cache:nonexistent");
    expect(retrieved).toBeNull();
  });

  it("should expire values after TTL passes", async () => {
    const key = "cache:expiring-item";
    // Set 0.05 second TTL (50ms)
    await cacheManager.set(key, { temp: true }, 0.05);

    // Wait 70ms
    await new Promise((resolve) => setTimeout(resolve, 70));

    const retrieved = await cacheManager.get(key);
    expect(retrieved).toBeNull();
  });

  it("should invalidate all keys matching prefix wildcard", async () => {
    await cacheManager.set("cache:/api/products?category=laptops", { data: 1 }, 60);
    await cacheManager.set("cache:/api/products?category=audio", { data: 2 }, 60);
    await cacheManager.set("cache:/api/categories", { data: 3 }, 60);

    expect(cacheManager.size()).toBe(3);

    // Delete all product cache keys
    await cacheManager.del("cache:/api/products*");

    expect(await cacheManager.get("cache:/api/products?category=laptops")).toBeNull();
    expect(await cacheManager.get("cache:/api/products?category=audio")).toBeNull();
    // Categories should remain untouched
    expect(await cacheManager.get("cache:/api/categories")).toEqual({ data: 3 });
  });
});
