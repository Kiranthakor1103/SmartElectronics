const isBrowser = () => typeof window !== "undefined";

export function getStorageItem<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === "undefined" || raw === "null") return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    if (value === undefined || value === null) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded — ignore */
  }
}

export function removeStorageItem(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function getStoredUser(): { id?: string; _id?: string; email?: string; name?: string; role?: string } | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined" || raw === "null") return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getCurrentUserIdentifier(): string | null {
  const user = getStoredUser();
  if (!user) return null;
  return user._id || user.id || (user.email ? user.email.toLowerCase().trim() : null) || null;
}

export function getUserStorageKey(type: "cart" | "wishlist", userIdentifier?: string | null): string {
  const id = userIdentifier !== undefined ? userIdentifier : getCurrentUserIdentifier();
  if (id) {
    // Sanitize key for local storage
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "_");
    return `kt-${type}_user_${safeId}`;
  }
  return `kt-${type}_guest`;
}

export const STORAGE_KEYS = {
  cart: "kt-cart-v1",
  wishlist: "kt-wishlist-v1",
  recentlyViewed: "kt-recent-v1",
  orderHistory: "kt-orders-v1",
} as const;
