import type { Product } from "@/app/lib/redux/features/product/productsSlice";
import type { CartItem } from "@/app/lib/redux/features/cart/cartSlice";
import type { Coupon } from "@/app/lib/constants/ecommerce";

const API_URL = "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || localStorage.getItem("authToken");
}

function getAuthHeaders(): HeadersInit | null {
  const token = getToken();
  if (!token) return null;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export const userStoreService = {
  async fetchUserWishlist(): Promise<Product[] | null> {
    const headers = getAuthHeaders();
    if (!headers) return null;

    try {
      const res = await fetch(`${API_URL}/wishlist?_=${Date.now()}`, {
        method: "GET",
        credentials: "include",
        headers,
        cache: "no-store",
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.data?.items || data?.items || [];
    } catch {
      return null;
    }
  },

  async syncUserWishlist(items: Product[]): Promise<boolean> {
    const headers = getAuthHeaders();
    if (!headers) return false;

    try {
      const res = await fetch(`${API_URL}/wishlist`, {
        method: "PUT",
        credentials: "include",
        headers,
        body: JSON.stringify({ items }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async fetchUserCart(): Promise<{ items: CartItem[]; coupon: Coupon | null } | null> {
    const headers = getAuthHeaders();
    if (!headers) return null;

    try {
      const res = await fetch(`${API_URL}/cart?_=${Date.now()}`, {
        method: "GET",
        credentials: "include",
        headers,
        cache: "no-store",
      });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        items: data?.data?.items || data?.items || [],
        coupon: data?.data?.coupon || data?.coupon || null,
      };
    } catch {
      return null;
    }
  },

  async syncUserCart(items: CartItem[], coupon: Coupon | null): Promise<boolean> {
    const headers = getAuthHeaders();
    if (!headers) return false;

    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "PUT",
        credentials: "include",
        headers,
        body: JSON.stringify({ items, coupon: coupon ?? null }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
